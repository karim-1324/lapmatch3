import os
import sys
import django
import pandas as pd

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'laptopfinder.settings')
django.setup()

from api.models import Laptop

def generate_id(laptop, index):
    """Generate a unique ID for each laptop"""
    brand = laptop.get('brand', '').lower().replace(' ', '-')
    model = laptop.get('model', '').lower().replace(' ', '-')
    return f"{brand}-{model}-{index}"

def import_csv(csv_path):
    """Import laptop data from CSV file"""
    try:
        # Try different encodings
        encodings = ['utf-8', 'latin1', 'ISO-8859-1', 'cp1252']
        
        for encoding in encodings:
            try:
                # Read CSV file with specific encoding
                print(f"Trying to read CSV with {encoding} encoding...")
                df = pd.read_csv(csv_path, encoding=encoding)
                print(f"Successfully read CSV with {encoding} encoding")
                break
            except UnicodeDecodeError:
                print(f"Failed to read with {encoding} encoding, trying next...")
                if encoding == encodings[-1]:
                    raise Exception("Could not read CSV file with any of the attempted encodings")
        
        # Convert column names to snake_case to match model field names
        df.columns = [col.lower().replace(' ', '_') for col in df.columns]
        
        # Print column names for debugging
        print("CSV columns:", df.columns.tolist())
        
        # Rename columns if needed to match model fields
        column_mapping = {
            'displaysize': 'display_size',
            'displayresolution': 'display_resolution',
            'producturl': 'product_url',
            'imageurl': 'image_url',
            'instock': 'in_stock'
        }
        
        df = df.rename(columns=column_mapping)
        
        # Check if table exists
        from django.db import connection
        with connection.cursor() as cursor:
            tables = connection.introspection.table_names()
            print("Available tables:", tables)
            if 'api_laptop' not in tables:
                print("ERROR: api_laptop table not found in the database!")
                print("Make sure you're using the correct database and migrations have been applied.")
                return
        
        # Clear existing data
        print("Deleting existing data...")
        Laptop.objects.all().delete()
        print("Previous data deleted")
        
        # Process each laptop record
        laptops_to_create = []
        for i, row in df.iterrows():
            data = row.to_dict()
            
            # Generate ID if not present
            if 'id' not in data or not data['id']:
                data['id'] = generate_id(data, i)
            
            # Set name if not present
            if 'name' not in data or not data['name']:
                data['name'] = f"{data.get('brand', '')} {data.get('model', '')}"
            
            # Convert in_stock to boolean format
            if 'in_stock' in data:
                data['in_stock'] = str(data['in_stock']).lower() in ('in stock', 'yes', '1')
            elif 'in stock' in data:
                data['in_stock'] = str(data['in stock']).lower() in ('true', 'in stock', 'yes', '1')
            
            # Format storage values consistently
            if 'storage' in data and data['storage']:
                try:
                    # Convert to float and then back to string with one decimal place
                    storage_value = float(str(data['storage']).replace('GB', '').replace('TB', '1024').strip())
                    data['storage'] = f"{storage_value:.1f}"
                except (ValueError, TypeError):
                    print(f"Warning: Could not convert storage '{data['storage']}' for row {i}")
            
            # Convert price to decimal if it's not already
            if 'price' in data and not isinstance(data['price'], (int, float)):
                try:
                    # Remove currency symbols and commas
                    price_str = str(data['price']).replace('$', '').replace(',', '').strip()
                    
                    # Check for EGY currency and convert to a float
                    if 'EGY' in price_str:
                        price_str = price_str.replace('EGY', '').strip()
                    
                    # Convert to float
                    data['price'] = float(price_str)
                except ValueError:
                    print(f"Warning: Could not convert price '{data['price']}' to decimal for row {i}")
                    data['price'] = 0.0
            
            # Create Laptop object
            try:
                laptops_to_create.append(Laptop(**data))
            except Exception as e:
                print(f"Error creating laptop from row {i}: {str(e)}")
                print(f"Data: {data}")
        
        # Bulk create laptops
        Laptop.objects.bulk_create(laptops_to_create)
        print(f"{len(laptops_to_create)} laptops imported successfully")
            
    except Exception as e:
        print(f"Error importing data: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python import_data.py <path_to_csv_file>")
        sys.exit(1)
    
    csv_path = sys.argv[1]
    import_csv(csv_path)