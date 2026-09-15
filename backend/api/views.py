from django.http import JsonResponse

from .data import ITEMS


def item_list(request):
    return JsonResponse({'items': ITEMS})


def item_detail(request, item_id):
    item = next((i for i in ITEMS if i['id'] == item_id), None)
    if item is None:
        return JsonResponse({'error': 'not found'}, status=404)
    return JsonResponse(item)
