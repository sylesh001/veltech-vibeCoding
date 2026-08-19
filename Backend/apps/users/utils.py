from decimal import Decimal

class CurrencyConverter:
    # Static exchange rates relative to USD.
    # Future enhancement: Fetch these from a real-time API.
    RATES_TO_USD = {
        'USD': Decimal('1.0'),
        'EUR': Decimal('0.92'),
        'GBP': Decimal('0.79'),
        'INR': Decimal('83.0'),
        'JPY': Decimal('150.0'),
    }

    @classmethod
    def get_rate(cls, currency):
        return cls.RATES_TO_USD.get(currency.upper(), Decimal('1.0'))

    @classmethod
    def to_base(cls, amount, user_currency):
        """Convert from user's currency to base currency (USD)."""
        if not amount:
            return amount
        rate = cls.get_rate(user_currency)
        return (Decimal(str(amount)) / rate).quantize(Decimal('0.01'))

    @classmethod
    def from_base(cls, amount, user_currency):
        """Convert from base currency (USD) to user's currency."""
        if not amount:
            return amount
        rate = cls.get_rate(user_currency)
        return (Decimal(str(amount)) * rate).quantize(Decimal('0.01'))
