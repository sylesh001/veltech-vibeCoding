from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.core.validators import RegexValidator


class UserManager(BaseUserManager):
    """Custom user manager that uses email instead of username."""

    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field is required.')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, name, password, **extra_fields)


phone_regex = RegexValidator(
    regex=r'^\+?1?\d{9,15}$',
    message='Phone number must be entered in the format: "+999999999". Up to 15 digits allowed.'
)


class User(AbstractUser):
    """Custom user model that uses email as the unique identifier."""

    username = None  # Remove username field
    email = models.EmailField(
        'email address',
        unique=True,
        error_messages={
            'unique': 'A user with that email already exists.',
        },
    )
    name = models.CharField('full name', max_length=150)
    mobile_number = models.CharField(
        'mobile number',
        max_length=17,
        validators=[phone_regex],
        blank=True,
        default='',
    )
    currency = models.CharField(
        'preferred currency',
        max_length=3,
        default='INR',
    )
    profile_photo = models.ImageField(
        'profile photo',
        upload_to='profiles/',
        null=True,
        blank=True,
    )

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        db_table = 'users'
        verbose_name = 'user'
        verbose_name_plural = 'users'
        ordering = ['-date_joined']

    def __str__(self):
        return self.email
