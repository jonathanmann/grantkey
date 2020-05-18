#!/usr/bin/env python
from os import chmod,path
from Crypto.PublicKey import RSA
from Crypto.Signature.pkcs1_15 import PKCS115_SigScheme
from Crypto.Hash import SHA256
import binascii

class GrantKeyClient:
    def __init__(self,key_size=3072,key_path="config/key.pem"):

        self.key_size = key_size
        self.key_path = key_path

        # Load or create RSA key pair 
        self.key = self.get_key()

        # Get Public key
        self.public_key = self.key.publickey()

    def get_key(self):
        if path.exists(self.key_path):
            key = RSA.importKey(open(self.key_path,'r').read())
        else:
            key = RSA.generate(self.key_size)
            with open(self.key_path, 'wb') as f:
                chmod(self.key_path, 0o600)
                f.write(key.exportKey('PEM'))
        return key

    def get_msg_hash(self,msg):
        return SHA256.new(str.encode(msg))

    def get_msg_signature(self,msg):
        msg_hash = self.get_msg_hash(msg)
        return PKCS115_SigScheme(self.key).sign(msg_hash)

    def validate_signature(self,msg,signature,signing_public_key):
        msg_hash = self.get_msg_hash(msg)
        try:
            PKCS115_SigScheme(signing_public_key).verify(msg_hash, signature)
            return True
        except:
            return False

    def import_validation_key(self,import_path):
        pass

    def export_validation_key(self,export_path):
        pass

    def import_validation_signature(self,export_path):
        pass

    def export_validation_signature(self,export_path):
        pass

    def validate_file(self,validation_key,validation_signature,file_path):
        pass

if __name__ == '__main__':
    g = GrantKeyClient()
    s = g.get_msg_signature('hello world')
    k = g.public_key
    print(g.validate_signature('hello world',s,k))
