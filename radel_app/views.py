import json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.shortcuts import render
from radel_app.crypto import CryptographicPrimitives

cryptotools = CryptographicPrimitives()
def index(request):
    return render(request, 'index.html')

@csrf_exempt
def main(request):
    data = json.loads(request.body)
    cipher = data.get("cipher_id")
    text = data.get("data")
    key = data.get("key")
    mode = data.get("mode")

    if text is None:
        return JsonResponse({"error": "Вводимые вами данные пусты, пожалуйста, проверьте корректность вводимых данных и попробуйте снова"})

    if cipher == "aes_gcm":
        return JsonResponse({'result': cryptotools.aes_gcm(text, mode, key)})
    elif cipher == "sha256":
        return JsonResponse({'result': cryptotools.sha256(text)})
    elif cipher == 'chacha20':
        return JsonResponse({'result': cryptotools.chacha20(text, mode, key)})
    elif cipher == 'rot13':
        return JsonResponse({'result': cryptotools.rot13(text)})
    elif cipher == 'sha3':
        return JsonResponse({'result': cryptotools.sha3(text)})
    elif cipher == 'md5':
        return JsonResponse({'result': cryptotools.md5(text)})
    elif cipher == 'hmac':
        return JsonResponse({'result': cryptotools.hmac_sha256(text, key)})
    elif cipher == 'base64':
        return JsonResponse({'result': cryptotools.base64(text, mode)})
    elif cipher == 'base32':
        return JsonResponse({'result': cryptotools.base32(text, mode)})
    else:
        return JsonResponse({'result': 'произошла ошибка, пожалуйста попробуйте позднее'})
