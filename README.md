# GrantKey

## Overview
GrantKey is software that allows any guarantor to issue reputation-backed digital credit grants which can be used by anyone willing to accepting them. If multiple parties trust a the guarantor, but not each other, this software will allow the guarantor to function as a clearinghouse by which credit backed by the guarantor can be transferred from one party to another. 

## Technical Description
The guarantor begins by issuing credit grants to the public key personas of the users of the service each grant is digitally signed by the guarantor. When the users want to exchange portions of their credit grants, they simply submit a digitally signed request the guarantor's clearinghouse API (provided as part of this project). As long as the requestor has sufficient grant credit as validated by the guarantor's tracking database (also provided by this project), the API will automatically validate the transaction and present a guarantor signed authorization and the grant balances for the transacting parties will be updated in the guarantor's tracking database.

## Client Usage
The client allows a user to create, sign, and verify transactions. The client is designed to interoperate with server insances, but users are able to transact with eachother using only client instances if email is used to send and receive transactions and perform the subsequent validations.

### Transaction Requirements
A transaction requires the following fields:
uuid,timestamp,sender public key, recipient public key, amount, denomination, and sender signature 

## Roadmap
### Improved Documentation
### Grant Ledger Database
### Transaction History Audit API
### Simple Key Integration
### Automated Transaction Signing
### Guarantor Clearinghouse Server
### Smart Contracts
### Interoperability Protocols

# About
This project was created as part of my masters research at NYU for _CS-GY 9963 Advanced Project in Computer Science_. The intent is to provide a functional prototype of the architecture described in my research. It is my hope that others will build on this research and either fork this project or create their own implementations. For more information please visit the website I created for this project, [grantkey.com](https://www.grantkey.com).
