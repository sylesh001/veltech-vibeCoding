from rest_framework import viewsets, filters, views, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
from .models import Expense, DataSyncHistory
from .serializers import ExpenseSerializer, DataSyncHistorySerializer
from .permissions import IsOwner
from apps.incomes.models import Income
from apps.users.utils import CurrencyConverter
import csv
import io
import datetime

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'payment_method', 'date']
    search_fields = ['category__name', 'note']
    ordering_fields = ['amount', 'date', 'created_at']
    
    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TransactionExportView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="transactions.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Date', 'Type', 'Category/Source', 'Amount', 'Payment Method', 'Note'])
        
        expenses = Expense.objects.filter(user=request.user).order_by('-date')
        incomes = Income.objects.filter(user=request.user).order_by('-date')
        
        transactions = []
        for e in expenses:
            transactions.append({
                'date': e.date,
                'type': 'Expense',
                'category': e.category,
                'amount': f"-{CurrencyConverter.from_base(e.amount, request.user.currency)}",
                'payment_method': e.payment_method,
                'note': e.note
            })
        for i in incomes:
            transactions.append({
                'date': i.date,
                'type': 'Income',
                'category': i.source,
                'amount': f"+{CurrencyConverter.from_base(i.amount, request.user.currency)}",
                'payment_method': '',
                'note': i.note
            })
            
        transactions.sort(key=lambda x: x['date'], reverse=True)
        
        for t in transactions:
            writer.writerow([
                t['date'],
                t['type'],
                t['category'],
                t['amount'],
                t['payment_method'],
                t['note']
            ])
            
        # Log Export
        DataSyncHistory.objects.create(
            user=request.user,
            action='export',
            details=f"Exported {len(transactions)} transactions."
        )
            
        return response

class CSVImportView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if 'file' not in request.FILES:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
            
        file = request.FILES['file']
        if not file.name.endswith('.csv'):
            return Response({'detail': 'This is not a csv file.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            decoded_file = file.read().decode('utf-8-sig')
            io_string = io.StringIO(decoded_file)
            reader = csv.DictReader(io_string)
            
            # expected headers: Date, Type, Category/Source, Amount, Payment Method, Note
            created_count = 0
            for row in reader:
                date_str = row.get('Date', '').strip()
                t_type = row.get('Type', '').strip().lower()
                cat_src = row.get('Category/Source', '').strip()
                amount_str = row.get('Amount', '').replace('+', '').replace('-', '').strip()
                payment = row.get('Payment Method', '').strip()
                note = row.get('Note', '').strip()
                
                if not date_str or not t_type or not amount_str:
                    continue
                    
                try:
                    # handle different date formats if needed, or stick to YYYY-MM-DD
                    date_obj = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
                except ValueError:
                    continue
                    
                try:
                    amount_val = float(amount_str)
                    amount_val_base = CurrencyConverter.to_base(amount_val, request.user.currency)
                except ValueError:
                    continue
                    
                if t_type == 'expense':
                    Expense.objects.create(
                        user=request.user,
                        date=date_obj,
                        category=cat_src,
                        amount=amount_val_base,
                        payment_method=payment or 'Card',
                        note=note
                    )
                    created_count += 1
                elif t_type == 'income':
                    Income.objects.create(
                        user=request.user,
                        date=date_obj,
                        source=cat_src,
                        amount=amount_val_base,
                        note=note
                    )
                    created_count += 1
                    
            # Log Import
            if created_count > 0:
                DataSyncHistory.objects.create(
                    user=request.user,
                    action='import',
                    details=f"Imported {created_count} transactions."
                )
                    
            return Response({'message': f'Successfully imported {created_count} transactions.'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': f'Error processing file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

class DataSyncHistoryListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        history = DataSyncHistory.objects.filter(user=request.user)
        serializer = DataSyncHistorySerializer(history, many=True)
        return Response(serializer.data)

class ResetTransactionsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        expenses_count, _ = Expense.objects.filter(user=request.user).delete()
        incomes_count, _ = Income.objects.filter(user=request.user).delete()
        
        DataSyncHistory.objects.create(
            user=request.user,
            action='reset',
            details=f"Reset data. Deleted {expenses_count} expenses and {incomes_count} incomes."
        )
        
        return Response({
            'message': f"Successfully deleted {expenses_count} expenses and {incomes_count} incomes."
        }, status=status.HTTP_200_OK)
