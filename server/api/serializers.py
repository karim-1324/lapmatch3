from rest_framework import serializers
from .models import Laptop, Favorite

class LaptopSerializer(serializers.ModelSerializer):
    display_size = serializers.CharField(required=False)
    display_resolution = serializers.CharField(required=False)
    product_url = serializers.URLField(required=False)
    image_url = serializers.URLField(required=False)
    in_stock = serializers.BooleanField(default=False)

    class Meta:
        model = Laptop
        fields = [
            'id', 'name', 'brand', 'model', 'category', 
            'processor', 'graphics', 'ram', 'storage', 
            'display', 'display_size', 'display_resolution', 
            'price', 'product_url', 'image_url', 
            'in_stock', 'seller', 'condition'
        ]

# Add the FavoriteSerializer class
class FavoriteSerializer(serializers.ModelSerializer):
    laptop = LaptopSerializer(read_only=True)
    laptop_id = serializers.PrimaryKeyRelatedField(
        queryset=Laptop.objects.all(),
        source='laptop',
        write_only=True
    )
    
    class Meta:
        model = Favorite
        fields = ['id', 'user', 'laptop', 'laptop_id', 'created_at']
        read_only_fields = ['user']
