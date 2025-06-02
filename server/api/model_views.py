from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import sys
import os
import math
import numpy as np
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from model.laptop_retrieval_system import LaptopRetrievalSystem
from model.model_trainer import LaptopQueryClassifier

# Create singleton instances
retrieval_system = None
query_classifier = None
classifier_available = False

def initialize_systems():
    global retrieval_system, query_classifier, classifier_available
    
    # Initialize retrieval system if not already initialized
    if retrieval_system is None:
        retrieval_system = LaptopRetrievalSystem()
    
    # Initialize classifier if not already initialized
    if query_classifier is None:
        try:
            query_classifier = LaptopQueryClassifier()
            query_classifier.load_model()
            classifier_available = True
            print("Query classifier loaded successfully.")
        except (ImportError, FileNotFoundError) as e:
            classifier_available = False
            print(f"Query classifier not available: {e}")

# Initialize systems at module load time
initialize_systems()

class LaptopFinderView(APIView):
    def post(self, request):
        try:
            # Get query and filters from request
            query = request.data.get('query', '')
            filters = request.data.get('filters', {})
            
            # Use the global instances instead of creating new ones
            global retrieval_system, query_classifier, classifier_available
            
            # Process the query with the classifier if available
            if classifier_available and query:
                # Analyze the query to get the category and confidence
                analysis = query_classifier.analyze_query(query)
                predicted_category = analysis['predicted_category']
                confidence = analysis['categories'][predicted_category]
                
                print(f"Detected use case: {predicted_category.title()} (confidence: {confidence:.2f})")
                
                # Map the classifier categories to our use case categories
                category_mapping = {
                    'student': 'study',
                    'business': 'business',
                    'gaming': 'gaming',
                    'multimedia': 'multimedia',
                    'engineering': 'engineering',
                    '2-in-1': 'study',
                    'portable': 'business',
                    'data science': 'data science',
                    'budget': None  
                }
                
                if predicted_category in category_mapping and category_mapping[predicted_category]:
                    filters['use_case'] = category_mapping[predicted_category]
                    
                # Apply specialized requirements directly based on classifier prediction
                if predicted_category == 'gaming':
                    if 'ram_min' not in filters:
                        filters['ram_min'] = 10
                    if 'performance_level' not in filters:
                        filters['performance_level'] = 'Moderate'
                    if 'gpu' not in filters:
                        filters['gpu'] = 'discrete'
                
                elif predicted_category == 'engineering':
                    if 'ram_min' not in filters:
                        filters['ram_min'] = 16
                    if 'performance_level' not in filters:
                        filters['performance_level'] = 'Moderate'
                    if 'gpu' not in filters:
                        filters['gpu'] = 'discrete'
                
                elif predicted_category == 'multimedia':
                    if 'ram_min' not in filters:
                        filters['ram_min'] = 16
                    if 'performance_level' not in filters:
                        filters['performance_level'] = 'Moderate'
                
                elif predicted_category == 'data science':
                    if 'ram_min' not in filters:
                        filters['ram_min'] = 16
                    if 'performance_level' not in filters:
                        filters['performance_level'] = 'High'
                    if 'gpu' not in filters:
                        filters['gpu'] = 'discrete'
                
                elif predicted_category == 'student':
                    if 'ram_min' not in filters:
                        filters['ram_min'] = 4
                    if 'performance_level' not in filters:
                        filters['performance_level'] = 'Basic'
                
                elif predicted_category == 'business':
                    if 'ram_min' not in filters:
                        filters['ram_min'] = 8
                    if 'performance_level' not in filters:
                        filters['performance_level'] = 'Basic'
                
                # Check for additional specialized requirements in the query
                if 'logic circuit' in query.lower() or 'verilog' in query.lower() or 'hdl' in query.lower():
                    if 'ram_min' not in filters:
                        filters['ram_min'] = 12
                    if 'performance_level' not in filters:
                        filters['performance_level'] = 'Moderate'
                
                elif 'creator' in query.lower() or 'content creation' in query.lower() or 'video editing' in query.lower():
                    if 'ram_min' not in filters:
                        filters['ram_min'] = 16
                    if 'performance_level' not in filters:
                        filters['performance_level'] = 'High'
                    if 'gpu' not in filters:
                        filters['gpu'] = 'discrete'
                
                elif 'workstation' in query.lower() or 'professional' in query.lower():
                    if 'ram_min' not in filters:
                        filters['ram_min'] = 12
                    if 'performance_level' not in filters:
                        filters['performance_level'] = 'Moderate'
                    if 'gpu' not in filters:
                        filters['gpu'] = 'discrete'
                
                elif 'animation' in query.lower() or '3d' in query.lower() or 'modeling' in query.lower():
                    if 'ram_min' not in filters:
                        filters['ram_min'] = 32
                    if 'performance_level' not in filters:
                        filters['performance_level'] = 'High'
                    if 'gpu' not in filters:
                        filters['gpu'] = 'discrete'
            
            # Get results and filter messages from the retrieval system
            results, filter_messages = retrieval_system.search(query, top_n=20, filters=filters)
            
            # Clean the results to ensure JSON compatibility
            cleaned_results = []
            for laptop in results:
                cleaned_laptop = {}
                for key, value in laptop.items():
                    # Handle numpy types and convert to Python native types
                    if isinstance(value, (np.integer, np.int64, np.int32)):
                        cleaned_laptop[key] = int(value)
                    # Include standard float type and use math.isfinite
                    elif isinstance(value, (np.floating, np.float64, np.float32, float)):
                        # Replace inf, -inf, nan with None
                        if math.isfinite(value):
                            cleaned_laptop[key] = float(value)
                        else:
                            cleaned_laptop[key] = None
                    elif isinstance(value, np.ndarray):
                        # Convert numpy arrays to lists
                        cleaned_laptop[key] = value.tolist()
                    else:
                        cleaned_laptop[key] = value

                cleaned_results.append(cleaned_laptop)

            # Return the cleaned results and filter messages
            return Response({
                'results': cleaned_results,
                'filter_messages': filter_messages
            })

        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Add this method to handle GET requests
    def get(self, request):
        try:
            # Get query and filters from query parameters
            query = request.query_params.get('query', '')
            
            # Parse filters from query parameters
            filters = {}
            for key, value in request.query_params.items():
                if key != 'query' and value:
                    # Handle numeric values
                    if key in ['ram_min', 'storage_min', 'price_min', 'price_max']:
                        try:
                            filters[key] = float(value)
                        except ValueError:
                            pass
                    else:
                        filters[key] = value
            
            # Use the global instances instead of creating new ones
            global retrieval_system, query_classifier, classifier_available
            
            # Process the query with the classifier if available
            if classifier_available and query:
                # Analyze the query to get the category and confidence
                analysis = query_classifier.analyze_query(query)
                predicted_category = analysis['predicted_category']
                confidence = analysis['categories'][predicted_category]
                
                print(f"Detected use case: {predicted_category.title()} (confidence: {confidence:.2f})")
                
                # Map the classifier categories to our use case categories
                category_mapping = {
                    'student': 'study',
                    'business': 'business',
                    'gaming': 'gaming',
                    'multimedia': 'multimedia',
                    'engineering': 'engineering',
                    '2-in-1': 'study',
                    'portable': 'business',
                    'data science': 'data science',
                    'budget': None  
                }
                
                if predicted_category in category_mapping and category_mapping[predicted_category]:
                    filters['use_case'] = category_mapping[predicted_category]
                
                # Apply the same specialized requirements as in the POST method
                if predicted_category == 'gaming':
                    if 'ram_min' not in filters:
                        filters['ram_min'] = 10
                    if 'performance_level' not in filters:
                        filters['performance_level'] = 'Moderate'
                    if 'gpu' not in filters:
                        filters['gpu'] = 'discrete'
                
                elif predicted_category == 'engineering':
                    if 'ram_min' not in filters:
                        filters['ram_min'] = 16
                    if 'performance_level' not in filters:
                        filters['performance_level'] = 'Moderate'
                    if 'gpu' not in filters:
                        filters['gpu'] = 'discrete'
                
                elif predicted_category == 'multimedia':
                    if 'ram_min' not in filters:
                        filters['ram_min'] = 16
                    if 'performance_level' not in filters:
                        filters['performance_level'] = 'Moderate'
                
                elif predicted_category == 'data science':
                    if 'ram_min' not in filters:
                        filters['ram_min'] = 16
                    if 'performance_level' not in filters:
                        filters['performance_level'] = 'High'
                    if 'gpu' not in filters:
                        filters['gpu'] = 'discrete'
                
                elif predicted_category == 'student':
                    if 'ram_min' not in filters:
                        filters['ram_min'] = 4
                    if 'performance_level' not in filters:
                        filters['performance_level'] = 'Basic'
                
                elif predicted_category == 'business':
                    if 'ram_min' not in filters:
                        filters['ram_min'] = 8
                    if 'performance_level' not in filters:
                        filters['performance_level'] = 'Basic'
                
                # Check for additional specialized requirements in the query
                if 'logic circuit' in query.lower() or 'verilog' in query.lower() or 'hdl' in query.lower():
                    if 'ram_min' not in filters:
                        filters['ram_min'] = 12
                    if 'performance_level' not in filters:
                        filters['performance_level'] = 'Moderate'
                
                elif 'creator' in query.lower() or 'content creation' in query.lower() or 'video editing' in query.lower():
                    if 'ram_min' not in filters:
                        filters['ram_min'] = 16
                    if 'performance_level' not in filters:
                        filters['performance_level'] = 'High'
                    if 'gpu' not in filters:
                        filters['gpu'] = 'discrete'
                
                elif 'workstation' in query.lower() or 'professional' in query.lower():
                    if 'ram_min' not in filters:
                        filters['ram_min'] = 12
                    if 'performance_level' not in filters:
                        filters['performance_level'] = 'Moderate'
                    if 'gpu' not in filters:
                        filters['gpu'] = 'discrete'
                
                elif 'animation' in query.lower() or '3d' in query.lower() or 'modeling' in query.lower():
                    if 'ram_min' not in filters:
                        filters['ram_min'] = 32
                    if 'performance_level' not in filters:
                        filters['performance_level'] = 'High'
                    if 'gpu' not in filters:
                        filters['gpu'] = 'discrete'
            
            # Get results and filter messages from the retrieval system
            results, filter_messages = retrieval_system.search(query, top_n=20, filters=filters)
            
            # Clean the results to ensure JSON compatibility
            cleaned_results = []
            for laptop in results:
                cleaned_laptop = {}
                for key, value in laptop.items():
                    # Handle numpy types and convert to Python native types
                    if isinstance(value, (np.integer, np.int64, np.int32)):
                        cleaned_laptop[key] = int(value)
                    # Include standard float type and use math.isfinite
                    elif isinstance(value, (np.floating, np.float64, np.float32, float)):
                        # Replace inf, -inf, nan with None
                        if math.isfinite(value):
                            cleaned_laptop[key] = float(value)
                        else:
                            cleaned_laptop[key] = None
                    elif isinstance(value, np.ndarray):
                        # Convert numpy arrays to lists
                        cleaned_laptop[key] = value.tolist()
                    else:
                        cleaned_laptop[key] = value

                cleaned_results.append(cleaned_laptop)
            
            # Return the cleaned results and filter messages
            return Response({
                'results': cleaned_results,
                'filter_messages': filter_messages
            })

        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)