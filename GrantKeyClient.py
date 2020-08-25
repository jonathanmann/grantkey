#!/usr/bin/env python
from os import chmod,path
from Crypto.PublicKey import RSA
from Crypto.Signature.pkcs1_15 import PKCS115_SigScheme
from Crypto.Hash import SHA256
import uuid
from datetime import datetime
import requests
import tkinter as tk

    

class GrantKeyClient:
    def __init__(self,key_size=3072,private_key_path="config/private_key.pem",public_key_path="config/public_key.pem"):

        self.key_size = key_size
        self.private_key_path = private_key_path
        self.public_key_path = public_key_path

        # Load or create private key
        self.private_key = self.get_private_key()

        # Load or create public key
        self.public_key = self.get_public_key()

    def get_private_key(self):
        if path.exists(self.private_key_path):
            private_key = RSA.importKey(open(self.private_key_path,'r').read())
        else:
            private_key = RSA.generate(self.key_size)
            with open(self.private_key_path, 'wb') as f:
                chmod(self.private_key_path, 0o600)
                f.write(private_key.exportKey('PEM'))
        return private_key

    def get_public_key(self):
        if path.exists(self.public_key_path):
            public_key = RSA.importKey(open(self.public_key_path,'r').read())
        else:
            public_key = self.private_key.publickey()
            with open(self.public_key_path, 'wb') as f:
                chmod(self.public_key_path, 0o600)
                f.write(public_key.exportKey('PEM'))
        return public_key

    def get_recipient_key(self,key_path):
        return RSA.importKey(open(key_path,'r').read())

    def get_msg_hash(self,msg):
        return SHA256.new(str.encode(msg))

    def get_msg_signature(self,msg):
        msg_hash = self.get_msg_hash(msg)
        return PKCS115_SigScheme(self.private_key).sign(msg_hash)

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

    def export_transaction(self,recipient_key,amount=0,message='',denomination='flops'):
        fields = [
                'ID',
                'UTC Timestamp', 
                'Sender Public Key',
                'Recipient Public Key',
                'Amount',
                'Message',
                'Denomination',
                'Signature',
                ]
        
        tran = [
                str(uuid.uuid4()),
                str(datetime.utcnow()),
                str(self.public_key.exportKey('PEM'),'utf8'),
                str(recipient_key.exportKey('PEM'),'utf8'),
                str(amount),
                message,
                denomination,
                ]
        signature = self.get_msg_signature('\t'.join(tran))
        tran.append(str(signature))
        a = [fields[i] + ":\n" + e for i,e in enumerate(tran)]
        return '\n\n'.join(a)

    def validate_file(self,validation_key,validation_signature,file_path):
        pass

    def submit_transaction(self):
        r = requests.post('http://0.0.0.0:5000/repeat',json={'this':100,'that':10})
        print(r.status_code,r.reason,r.text)

if __name__ == '__main__':
    window = tk.Tk()
    greeting = tk.Label(
        text="Grantkey Client",
        fg="white",
        bg="black",
        width=100,
        height=10,
    )
    button = tk.Button(
        text="Click me!",
        width=25,
        height=5,
        bg="blue",
        fg="yellow",
    )
    host_name = tk.Entry(fg="yellow", bg="blue", width=50)
    greeting.pack()
    button.pack()
    host_name.pack()
    

    window.mainloop()
"""
    g = GrantKeyClient()
    s = g.get_msg_signature('hello world')
    k = g.public_key
    #r = g.get_recipient_key('config/pubkey2.pem')
    print(g.validate_signature('hello world',s,k))
    g.submit_transaction()
    #print(g.export_transaction(r,100))
"""

