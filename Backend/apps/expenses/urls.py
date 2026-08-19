from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpenseViewSet, TransactionExportView, CSVImportView, DataSyncHistoryListView, ResetTransactionsView

app_name = 'expenses'

router = DefaultRouter()
router.register(r'', ExpenseViewSet, basename='expense')

urlpatterns = [
    path('export/csv/', TransactionExportView.as_view(), name='expense-export-csv'),
    path('import/csv/', CSVImportView.as_view(), name='expense-import-csv'),
    path('sync-history/', DataSyncHistoryListView.as_view(), name='data-sync-history'),
    path('reset/', ResetTransactionsView.as_view(), name='reset-transactions'),
    path('', include(router.urls)),
]
