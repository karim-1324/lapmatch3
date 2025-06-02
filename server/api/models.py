from django.db import models

class Laptop(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    category = models.CharField(max_length=100, blank=True, null=True)
    processor = models.CharField(max_length=100, blank=True, null=True)
    graphics = models.CharField(max_length=100, blank=True, null=True)
    ram = models.CharField(max_length=50, blank=True, null=True)
    storage = models.CharField(max_length=100, blank=True, null=True)
    display = models.CharField(max_length=100, blank=True, null=True)
    display_size = models.CharField(max_length=50, blank=True, null=True)
    display_resolution = models.CharField(max_length=50, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=1, blank=True, null=True)
    product_url = models.URLField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    in_stock = models.BooleanField(default=False)
    seller = models.CharField(max_length=100, blank=True, null=True)
    condition = models.CharField(max_length=50, default='New')
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['brand', 'name']


# Add this to your existing models.py file
from django.contrib.auth.models import User

# Add this if it's not already there
class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    laptop = models.ForeignKey(Laptop, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'laptop')  # Prevent duplicate favorites
        ordering = ['-created_at']  # Most recent favorites first

