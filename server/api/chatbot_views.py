from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import google.generativeai as genai
import json
from .models import Laptop
from .serializers import LaptopSerializer
from django.db.models import Q
import traceback # Keep this if you want detailed error logging
import random

class ChatbotView(APIView):
    """
    API endpoint for the chatbot.
    Receives user message, gets specs from Gemini, filters laptops.
    """
    def post(self, request):
        user_message = request.data.get('message')
        if not user_message:
            return Response({"error": "No message provided"}, status=status.HTTP_400_BAD_REQUEST)

        if not settings.GEMINI_API_KEY:
            return Response({"error": "Gemini API key not configured"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            # Configure Gemini
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-1.5-flash') # Or another suitable model

            # Define the prompt for Gemini
            prompt = f"""
            Analyze the following user request for a laptop and extract the specifications.
            Focus on: category, budget (min_price, max_price), performance level (high, moderate, basic),
            brand, RAM in GB, storage size in GB, screen size (as a number like 13, 15, 17), screen resolution,
            processor (e.g., "Intel Core i7", "AMD Ryzen 5", "i9-13900H"), graphics (e.g., "NVIDIA RTX 4070", "AMD Radeon", "Intel Iris Xe","Intel UHD").

            For RAM, storage, and screen size, also determine if the user specified a minimum requirement (e.g., "X or more", "at least X").
            Set 'ram_is_minimum', 'storage_is_minimum', and 'screen_size_is_minimum' to true if a minimum is specified, otherwise false or null.

            assign al the use cases to those categories and don't put any other categories rather than the below
             categories like "multimedia", "engineering", "logic circuit", "data science", "machine learning",
            "content creation", "video editing", "gaming" ,"business","creator","student","standard","study","work"

            User request: "{user_message}"

            Return the extracted specifications ONLY as a JSON object. If a specification is not mentioned, use null for its value.
            Example JSON format:
            {{
              "category": ["Gaming"],
              "min_price": null,
              "max_price": null,
              "performance": null,
              "brand": ["MSI"],
              "ram": 64,
              "ram_is_minimum": false,
              "storage_gb": 1024,
              "storage_is_minimum": true,
              "screen_size_value": 15,
              "screen_size_is_minimum": true,
              "resolution": ["4K"],
              "processor": ["Intel Core i9"], # Can be specific model or series/brand
              "graphics": ["NVIDIA RTX"]     # Can be specific model or series/brand
            }}
            """

            # Call Gemini API
            response = model.generate_content(prompt)
            gemini_response_text = response.text.strip()

            # Clean the response to ensure it's valid JSON
            # Sometimes Gemini might add backticks or 'json' prefix
            if gemini_response_text.startswith('```json'):
                gemini_response_text = gemini_response_text[7:]
            if gemini_response_text.endswith('```'):
                gemini_response_text = gemini_response_text[:-3]
            gemini_response_text = gemini_response_text.strip()

            print(f"Gemini Raw Response: {gemini_response_text}") # For debugging

            # Parse the JSON response from Gemini
            try:
                specs = json.loads(gemini_response_text)
                
                # Check if all spec values are null or empty
                all_specs_null = True
                for key, value in specs.items():
                    # Skip checking these keys as they're boolean flags
                    if key in ['ram_is_minimum', 'storage_is_minimum', 'screen_size_is_minimum']:
                        continue
                    
                    if value is not None and value != "" and value != [] and value != {}:
                        all_specs_null = False
                        break
                
                # If all specs are null, this is likely not a laptop-related query
                if all_specs_null:
                    return Response({
                        "user_message": user_message,
                        "extracted_specs": specs,
                        "laptops": [],
                        "message": "I'm designed to help with laptop-related queries. Could you please ask something about laptops or specify what kind of laptop you're looking for?"
                    }, status=status.HTTP_200_OK)
                    
            except json.JSONDecodeError as e:
                print(f"JSON Decode Error: {e}")
                print(f"Problematic Text: {gemini_response_text}")
                return Response({"error": "Failed to parse specifications from AI response.", "details": gemini_response_text}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Define mappings for specialized categories
            specialized_category_mapping = {
                'content creation': ['content creation', 'video editing', 'photo editing', 'design', 'creative', 'adobe', 
                                    'photoshop', 'illustrator', 'premiere', 'after effects', 'graphic design', '3d modeling',
                                    'animation', 'rendering', 'CAD', 'multimedia', 'media production'],
                'multimedia': ['multimedia', 'media', 'streaming', 'videos', 'movies', 'entertainment', 'youtube', 'netflix',
                              'music production', 'audio editing', 'sound engineering', 'visual arts'],
                'engineering': ['engineering', 'engineer', 'circuit', 'electrical', 'electronics', 'simulation', 'cad/cam', 
                               'prototyping', 'pcb', 'logic circuit', 'verilog', 'hdl', 'fpga', 'microcontroller', 
                               'embedded system', 'autocad', 'solidworks', 'ansys', 'matlab', 'labview', 'plc', 
                               'robotics', 'automation'],
                'data science': ['data science', 'machine learning', 'ml', 'ai', 'artificial intelligence', 'deep learning',
                                'neural networks', 'tensorflow', 'pytorch', 'keras', 'data mining', 'data analysis',
                                'big data', 'analytics', 'statistical analysis', 'data processing', 'computer vision',
                                'nlp', 'natural language processing', 'predictive modeling', 'jupyter', 'pandas',
                                'numpy', 'scikit-learn', 'data visualization', 'reinforcement learning'],
                'logic circuit': ['logic circuit', 'verilog', 'hdl', 'fpga', 'circuit design', 'digital logic', 'circuit simulation'],
                'creator': ['creator', 'content creation', 'multimedia', 'video editing', 'photo editing', 'streaming'],
                'animation': ['animation', '3d modeling', '3d animation', 'blender', 'maya', '3ds max', 'rendering']
            }

            # Define specialized category requirements
            specialized_category_requirements = {
                'logic circuit': {
                    'friendly_name': 'Logic Circuit Design',
                    'min_ram': 12,
                    'recommended_ram': 32,
                    'min_performance': 'Moderate',
                    'recommended_performance': 'High',
                },
                'creator': {
                    'friendly_name': 'Content Creation & Multimedia',
                    'min_ram': 16,
                    'recommended_ram': 32,
                    'min_performance': 'Moderate',
                    'recommended_performance': 'High',
                },
                'engineering': {
                    'friendly_name': 'Engineering Software',
                    'min_ram': 16,
                    'recommended_ram': 32,
                    'min_performance': 'High',
                    'recommended_performance': 'High',
                    'gpu_required': True,
                    'description': 'Engineering applications like CAD and simulation software benefit from high RAM, good CPU, and discrete graphics.',
                    'related_terms': ['cad', 'solidworks', 'autocad', 'simulation', 'ansys', 'matlab', 'developer', 'programming', 'coding', 'software development']
                },
                'data science': {
                    'friendly_name': 'Data Science & Machine Learning',
                    'min_ram': 16,
                    'recommended_ram': 32,
                    'min_performance': 'Moderate',
                    'recommended_performance': 'High',
                    'gpu_required': True,
                    'description': 'Data science and ML workloads require substantial RAM and benefit greatly from GPU acceleration.',
                    'related_terms': ['machine learning', 'deep learning', 'ai', 'artificial intelligence', 'tensorflow', 'pytorch', 'data analysis']
                },
                'animation': {
                    'friendly_name': '3D Animation & Modeling',
                    'min_ram': 16,
                    'recommended_ram': 32,
                    'min_performance': 'Moderate',
                    'recommended_performance': 'High',
                },
                'content creation': {
                    'friendly_name': 'Content Creation & Multimedia',
                    'min_ram': 16,
                    'recommended_ram': 32,
                    'min_performance': 'Moderate',
                    'recommended_performance': 'High',
                },
                'multimedia': {
                    'friendly_name': 'Multimedia',
                    'min_ram': 16,
                    'recommended_ram': 32,
                    'min_performance': 'Moderate',
                    'recommended_performance': 'High',
                }
            }

            # Detect if any specialized category is present and what it is
            detected_specialized_category = None
            if specs.get('category'):
                categories = specs['category']
                if not isinstance(categories, list):
                    categories = [categories]
                
                for category in categories:
                    category_lower = str(category).lower()
                    for specialized_cat, keywords in specialized_category_mapping.items():
                        if any(keyword.lower() in category_lower for keyword in keywords):
                            detected_specialized_category = specialized_cat
                            break
                    if detected_specialized_category:
                        break

            # Filter laptops based on extracted specs
            queryset = Laptop.objects.all()

            # Apply specialized category requirements
            if detected_specialized_category:
                # Get the requirements for the detected category
                category_reqs = specialized_category_requirements.get(detected_specialized_category)
                
                if category_reqs:
                    # Apply RAM requirements
                    min_ram = category_reqs.get('min_ram')
                    if min_ram:
                        ram_filters = Q()
                        for ram_size in [size for size in [16, 32, 64, 128] if size >= min_ram]:
                            ram_filters |= Q(ram__startswith=f"{ram_size}")
                        queryset = queryset.filter(ram_filters)
                    
                    # Apply performance requirements based on min_performance
                    min_performance = category_reqs.get('min_performance')
                    if min_performance:
                        performance_filters = Q()
                        
                        if min_performance == 'High' or min_performance == 'Moderate':
                            # For high or moderate, include high-end processors
                            performance_filters |= (
                                Q(processor__icontains='i7') | 
                                Q(processor__icontains='i9') | 
                                Q(processor__icontains='ryzen 7') | 
                                Q(processor__icontains='ryzen 9') |
                                Q(processor__icontains='m1') |
                                Q(processor__icontains='m2') |
                                Q(processor__icontains='m3')
                            )
                            
                            if min_performance == 'Moderate':
                                # For moderate, also include mid-range processors
                                performance_filters |= (
                                    Q(processor__icontains='i5') | 
                                    Q(processor__icontains='ryzen 5')
                                )
                        
                        elif min_performance == 'Basic':
                            # For basic, include all processor levels
                            performance_filters |= (
                                Q(processor__icontains='i3') | 
                                Q(processor__icontains='i5') |
                                Q(processor__icontains='i7') |
                                Q(processor__icontains='i9') |
                                Q(processor__icontains='ryzen 3') |
                                Q(processor__icontains='ryzen 5') |
                                Q(processor__icontains='ryzen 7') |
                                Q(processor__icontains='ryzen 9') |
                                Q(processor__icontains='celeron') | 
                                Q(processor__icontains='pentium') | 
                                Q(processor__icontains='athlon')
                            )
                        
                        if performance_filters:
                            queryset = queryset.filter(performance_filters)
                    
                    # Apply GPU requirements if specified
                    if category_reqs.get('gpu_required'):
                        gpu_queryset = queryset.filter(
                            Q(graphics__icontains='nvidia') | 
                            Q(graphics__icontains='radeon') | 
                            Q(graphics__icontains='rtx') | 
                            Q(graphics__icontains='gtx')
                        )
                        # Use GPU-equipped laptops if enough are available
                        if gpu_queryset.count() >= 3:
                            queryset = gpu_queryset
                
                # For content creation and multimedia, ensure good display
                if detected_specialized_category in ['content creation', 'creator', 'multimedia', 'animation']:
                    queryset = queryset.filter(
                        Q(display_resolution__icontains='full hd') | 
                        Q(display_resolution__icontains='fhd') |
                        Q(display_resolution__icontains='2k') |
                        Q(display_resolution__icontains='4k') |
                        Q(display_resolution__icontains='uhd')
                    )

            # --- Apply regular filters based on specs ---
            if specs.get('brand'):
                brands = specs['brand']
                if isinstance(brands, list):
                    queryset = queryset.filter(brand__in=brands)
                elif isinstance(brands, str):
                    queryset = queryset.filter(brand=brands)

            if specs.get('min_price'):
                try:
                    queryset = queryset.filter(price__gte=float(specs['min_price']))
                except (ValueError, TypeError):
                    pass # Ignore invalid price

            if specs.get('max_price'):
                try:
                    queryset = queryset.filter(price__lte=float(specs['max_price']))
                except (ValueError, TypeError):
                    pass # Ignore invalid price

            if specs.get('performance') and not specs.get('processor'):
                performance_levels = specs['performance']
                if not isinstance(performance_levels, list):
                    performance_levels = [performance_levels]

                q_objects = Q()
                for level in performance_levels:
                    if level == 'high':
                        q_objects |= (
                            Q(processor__icontains='i7') | 
                            Q(processor__icontains='i9') | 
                            Q(processor__icontains='ryzen 7') | 
                            Q(processor__icontains='ryzen 9') |
                            Q(processor__icontains='m1') |
                            Q(processor__icontains='m2') |
                            Q(processor__icontains='m3')
                        ) & (
                            Q(graphics__icontains='NVIDIA rtx') |
                            Q(graphics__icontains='NVIDIA gtx') 
                        )&(
                            Q(ram__icontains='16') |Q(ram__icontains='24')|Q(ram__icontains='28')|Q(ram__icontains='32')|Q(ram__icontains='64')
                        )
                    elif level == 'moderate':
                        q_objects |= (
                            Q(processor__icontains='i5') | 
                            Q(processor__icontains='ryzen 5')
                        )& (Q(ram__icontains='12')|Q(ram__icontains='16'))
                    elif level == 'basic':
                        q_objects |= (
                            Q(processor__icontains='i3') |  
                            Q(processor__icontains='celeron') | 
                            Q(processor__icontains='pentium') | 
                            Q(processor__icontains='athlon')
                        )&(
                            Q(ram__icontains='4') |Q(ram__icontains='8')
                        )
                
                queryset = queryset.filter(q_objects)
                
           
            
            
            if specs.get('processor'):
                processors = specs['processor']
                if processors:
                    if not isinstance(processors, list):
                        processors = [processors]

                    q_processor_objects = Q()
                    for proc_val in processors:
                        if proc_val:
                            proc_str = str(proc_val).strip()
                            if proc_str.lower() == 'amd':
                                q_processor_objects |= Q(processor__istartswith='AMD')
                            elif proc_str.lower() == 'intel':
                                q_processor_objects |= Q(processor__istartswith='Intel')
                            else:
                                q_processor_objects |= Q(processor__icontains=proc_str)

                    if q_processor_objects:
                        queryset = queryset.filter(q_processor_objects)

            if specs.get('graphics'):
                graphics_cards = specs['graphics']
                if graphics_cards:
                    if not isinstance(graphics_cards, list):
                        graphics_cards = [graphics_cards]

                    q_graphics_objects = Q()
                    for gpu_val in graphics_cards:
                        if gpu_val:
                            gpu_str = str(gpu_val).strip()
                            if gpu_str.lower() == 'nvidia':
                                q_graphics_objects |= Q(graphics__istartswith='NVIDIA')
                            elif gpu_str.lower() == 'amd':
                                q_graphics_objects |= Q(graphics__istartswith='AMD') | Q(graphics__istartswith='Radeon')
                            elif gpu_str.lower() == 'intel':
                                q_graphics_objects |= Q(graphics__istartswith='Intel') | Q(graphics__istartswith='Iris')
                            else:
                                q_graphics_objects |= Q(graphics__icontains=gpu_str)

                    if q_graphics_objects:
                        queryset = queryset.filter(q_graphics_objects)

            if specs.get('screen_size_value'):
                screen_size_val = specs.get('screen_size_value')
                screen_is_minimum = specs.get('screen_size_is_minimum', True)

                try:
                    screen_float = float(screen_size_val)
                    if screen_is_minimum:
                        queryset = queryset.filter(display_size__gte=screen_float)
                    else:
                        queryset = queryset.filter(display_size__gte=screen_float, display_size__lt=screen_float + 1.0)

                except (ValueError, TypeError):
                    pass

            if specs.get('ram'):
                ram_values = specs.get('ram')
                ram_is_minimum = specs.get('ram_is_minimum', True)
                if ram_values is not None:
                    if not isinstance(ram_values, list):
                        ram_values = [ram_values]

                    q_ram_objects = Q()
                    common_ram_sizes = [8, 16, 32, 64, 128]

                    for ram_val in ram_values:
                        try:
                            ram_int_req = int(ram_val)
                            applicable_ram_sizes = []
                            if ram_is_minimum:
                                applicable_ram_sizes = [size for size in common_ram_sizes if size >= ram_int_req]
                            else:
                                applicable_ram_sizes = [size for size in common_ram_sizes if size == ram_int_req]

                            for size in applicable_ram_sizes:
                                q_ram_objects |= Q(ram__startswith=f"{size}")
                        except (ValueError, TypeError):
                            pass

                    if q_ram_objects:
                        queryset = queryset.filter(q_ram_objects)

            if specs.get('storage_gb'):
                storage_values_gb = specs.get('storage_gb')
                storage_is_minimum = specs.get('storage_is_minimum', True)
                if storage_values_gb is not None:
                    if not isinstance(storage_values_gb, list):
                        storage_values_gb = [storage_values_gb]

                    q_storage_objects = Q()
                    common_storage_sizes_gb = sorted([256, 512, 1000, 1024, 2000, 2048, 4000, 4096, 8000, 8192])

                    for storage_gb in storage_values_gb:
                        try:
                            storage_int_req = int(storage_gb)

                            applicable_storage_sizes = []
                            if storage_is_minimum:
                                applicable_storage_sizes = [size for size in common_storage_sizes_gb if size >= storage_int_req]
                            else:
                                if storage_int_req == 1000 or storage_int_req == 1024:
                                    applicable_storage_sizes = [1000, 1024]
                                elif storage_int_req == 2000 or storage_int_req == 2048:
                                    applicable_storage_sizes = [2000, 2048]
                                elif storage_int_req == 4000 or storage_int_req == 4096:
                                    applicable_storage_sizes = [4000, 4096]
                                elif storage_int_req == 8000 or storage_int_req == 8192:
                                    applicable_storage_sizes = [8000, 8192]
                                else:
                                    if storage_int_req in common_storage_sizes_gb:
                                        applicable_storage_sizes = [storage_int_req]

                            for size_gb in applicable_storage_sizes:
                                if size_gb == 1024 or size_gb == 1000:
                                    q_storage_objects |= Q(storage__icontains="1TB") | Q(storage__icontains="1 TB") | Q(storage__startswith="1024") | Q(storage__startswith="1000")
                                elif size_gb == 2048 or size_gb == 2000:
                                    q_storage_objects |= Q(storage__icontains="2TB") | Q(storage__icontains="2 TB") | Q(storage__startswith="2048") | Q(storage__startswith="2000")
                                elif size_gb == 4096 or size_gb == 4000:
                                    q_storage_objects |= Q(storage__icontains="4TB") | Q(storage__icontains="4 TB") | Q(storage__startswith="4096") | Q(storage__startswith="4000")
                                elif size_gb == 8192 or size_gb == 8000:
                                    q_storage_objects |= Q(storage__icontains="8TB") | Q(storage__icontains="8 TB") | Q(storage__startswith="8192") | Q(storage__startswith="8000")
                                else:
                                    q_storage_objects |= Q(storage__startswith=f"{size_gb}")
                                    q_storage_objects |= Q(storage__icontains=f"{size_gb}GB")
                                    q_storage_objects |= Q(storage__icontains=f"{size_gb} GB")

                        except (ValueError, TypeError):
                            pass

                    if q_storage_objects:
                        queryset = queryset.filter(q_storage_objects)

            if specs.get('resolution'):
                resolutions = specs['resolution']
                if resolutions is not None:
                    if not isinstance(resolutions, list):
                        resolutions = [resolutions]

                    q_resolution_objects = Q()
                    for res_val in resolutions:
                        if res_val:
                            q_resolution_objects |= Q(display_resolution__icontains=str(res_val))

                    if q_resolution_objects:
                        queryset = queryset.filter(q_resolution_objects)

            # --- Add In Stock Filter ---
            # Ensure only in-stock laptops are considered
            queryset = queryset.filter(in_stock=True)

            # --- Modify the price sorting to provide variety when price not specified ---
            price_specified = specs.get('min_price') is not None or specs.get('max_price') is not None
            
            # Get total number of filtered laptops
            total_laptops = queryset.count()
            
            # Define how many results to show
            results_limit = 10
            
            # If price is specified or very few results, use regular sorting
            if price_specified or total_laptops <= results_limit:
                if specs.get('max_price'):
                    # Sort by price descending if max price specified (show best options within budget)
                    queryset = queryset.order_by('-price')
                else:
                    # Otherwise sort by ascending price (show affordable options first)
                    queryset = queryset.order_by('price')
                
                # Limit results for chatbot response
                laptops = queryset[:results_limit]
            
            # If price is NOT specified and we have enough results, show price variety
            else:
                # For specialized categories or general requests, show a variety of price points
                
                # Create price segments for better variety
                # Get the min and max prices in our filtered queryset
                min_price = queryset.order_by('price').first().price if queryset.exists() else 0
                max_price = queryset.order_by('-price').first().price if queryset.exists() else 0
                
                if min_price == max_price:
                    # If all laptops have the same price, just take the top results
                    laptops = queryset[:results_limit]
                else:
                    # Create price segments
                    price_range = max_price - min_price
                    segment_size = price_range / 5  # Divide into 3 price segments
                    
                    low_segment = queryset.filter(price__lt=min_price + segment_size).order_by('?')
                    mid_segment = queryset.filter(
                        price__gte=min_price + segment_size,
                        price__lt=min_price + 2*segment_size
                    ).order_by('?')
                    high_segment = queryset.filter(price__gte=min_price + 2*segment_size).order_by('?')
                    
                    # Select a mix of laptops from each segment
                    # Adjust proportions based on what's available
                    laptops = []
                    
                    # Calculate how many to take from each segment
                    low_count = min(3, low_segment.count())
                    high_count = min(3, high_segment.count())
                    mid_count = min(results_limit - low_count - high_count, mid_segment.count())
                    
                    # If any segment is empty, redistribute to other segments
                    remaining = results_limit - low_count - mid_count - high_count
                    
                    if remaining > 0 and low_segment.count() > low_count:
                        additional = min(remaining, low_segment.count() - low_count)
                        low_count += additional
                        remaining -= additional
                    
                    if remaining > 0 and mid_segment.count() > mid_count:
                        additional = min(remaining, mid_segment.count() - mid_count)
                        mid_count += additional
                        remaining -= additional
                    
                    if remaining > 0 and high_segment.count() > high_count:
                        additional = min(remaining, high_segment.count() - high_count)
                        high_count += additional
                    
                    # Collect laptops from each segment
                    laptops.extend(list(low_segment[:low_count]))
                    laptops.extend(list(mid_segment[:mid_count]))
                    laptops.extend(list(high_segment[:high_count]))
                    
                    # Shuffle the laptops for more variety
                    random.shuffle(laptops)
                    
                    # Limit to requested results_limit
                    laptops = laptops[:results_limit]
            
            # Serialize the final laptop selection
            serializer = LaptopSerializer(laptops, many=True)

            # Create appropriate response message
            response_message = None
            if not serializer.data:
                if detected_specialized_category:
                    # Custom message for specialized category with no results
                    category_messages = {
                        'multimedia': "I understand you're looking for a multimedia laptop suitable for tasks like video editing and media consumption. I recommend a laptop with at least 16GB RAM, a good display, and preferably a dedicated graphics card.",
                        'engineering': "I understand you're looking for an engineering laptop suitable for tasks like circuit design and simulation. I recommend a laptop with at least 16GB RAM, a powerful processor (i7/Ryzen 7 or better), and preferably a dedicated graphics card.",
                        'data science': "I understand you're looking for a data science laptop suitable for machine learning and data analysis. I recommend a laptop with at least 16GB RAM, a powerful processor, and definitely a dedicated NVIDIA GPU for ML workloads.",
                        'content creation': "I understand you're looking for a content creation laptop suitable for tasks like photo/video editing. I recommend a laptop with at least 16GB RAM, a color-accurate display, and a dedicated graphics card."
                    }
                    response_message = category_messages.get(
                        detected_specialized_category,
                        f"I understand you need a laptop for {detected_specialized_category}, but couldn't find exact matches with current filters. Try checking for laptops with higher RAM (16GB+) and good processors (i7/Ryzen 7 or better)."
                    )
                else:
                    response_message = "Sorry, I couldn't find any laptops matching those specifications. Could you try with different requirements?"
            
            return Response({
                "user_message": user_message,
                "extracted_specs": specs, # Send specs back for debugging/info
                "laptops": serializer.data,
                "message": response_message
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(traceback.format_exc()) # Print detailed error
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
