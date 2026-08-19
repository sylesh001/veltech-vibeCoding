from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/expenses/', include('apps.expenses.urls')),
    path('api/incomes/', include('apps.incomes.urls')),
    path('api/budgets/', include('apps.budgets.urls')),
    path('api/categories/', include('apps.categories.urls')),
    path('api/accounts/', include('apps.accounts.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
