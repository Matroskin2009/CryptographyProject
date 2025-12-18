import hashlib
import base64
import hmac
import os
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

class CryptographicPrimitives:
    def aes_gcm(self, text, mode, key_hex):
        if key_hex is None:
            if mode == "Засекретить":
                key = os.urandom(32)
                key_hex = key.hex()
            else:
                return {'result': 'Для расшифровки нужен ключ'}
        else:
            key = bytes.fromhex(key_hex)
            if len(key) != 32:
                return {'result': 'Неверный ключ'}
        if mode == "Засекретить":
            data = text.encode('utf-8')
            cipher = AESGCM(key)
            nonce = os.urandom(12)
            ciphertext = cipher.encrypt(nonce, data, None)
            combined = nonce + ciphertext
            return {
                'result': combined.hex(),
                'result_key': key_hex
            }
        else:
            data = bytes.fromhex(text)
            nonce = data[:12]
            ciphertext = data[12:]
            cipher = AESGCM(key)
            plaintext = cipher.decrypt(nonce, ciphertext, None).decode()
            return {'result': plaintext}

    def sha256(self, text):
        return hashlib.sha256(text.encode('utf-8')).hexdigest()

    def chacha20(self, text, mode, key_hex):
        if key_hex is None:
            if mode == "Засекретить":
                key = os.urandom(32)
                key_hex = key.hex()
            else:
                return {'result': 'Для расшифровки нужен ключ'}
        else:
            key = bytes.fromhex(key_hex)
            if len(key) != 32:
                return {'result': 'неверный ключ'}
        if mode == "Засекретить":
            data = text.encode('utf-8')
            nonce = os.urandom(16)
            cipher = Cipher(algorithms.ChaCha20(key, nonce), mode=None, backend=default_backend())
            encryptor = cipher.encryptor()
            ciphertext = encryptor.update(data) + encryptor.finalize()
            combined = nonce + ciphertext
            return {
                'result': combined.hex(),
                'result_key': key_hex
            }
        else:
            data = bytes.fromhex(text)
            nonce = data[:16]
            ciphertext = data[16:]
            cipher = Cipher(algorithms.ChaCha20(key, nonce), mode=None, backend=default_backend())
            decrypter = cipher.decryptor()
            plaintext = decrypter.update(ciphertext) + decrypter.finalize()
            return {'result': plaintext.decode('utf-8')}

    def rot13(self, text):
        return text.translate(str.maketrans(
            'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
            'nopqrstuvwxyzabcdefghijklmNOPQRSTUVWXYZABCDEFGHIJKLM'
        ))

    def sha3(self, text):
        return hashlib.sha3_256(text.encode('utf-8')).hexdigest()

    def md5(self, text):
        return hashlib.md5(text.encode('utf-8')).hexdigest()

    def hmac_sha256(self, text, key):
        if key is None:
            return 'Нужен ключ для HMAC'
        key = bytes.fromhex(key)
        if len(key) != 32:
            return 'Неверный ключ'
        h = hmac.new(key, text.encode('utf-8'), hashlib.sha256)
        return h.hexdigest()

    def base64(self, text, mode):
        if mode == "Засекретить":
            return base64.b64encode(text.encode('utf-8')).decode('ascii')
        else:
            decoded = base64.b64decode(text)
            return decoded.decode('utf-8')

    def base32(self, text, mode):
        if mode == "Засекретить":
            data = text.encode('utf-8')
            return base64.b32encode(data).decode('ascii')
        else:
            data = text.encode('ascii')
            decoded = base64.b32decode(data)
            return decoded.decode('utf-8')
