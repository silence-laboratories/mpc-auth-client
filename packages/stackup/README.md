## AA Demo Frontend
This is the frontend of the AA demo project. It is a next app that uses the ERC-4337 stackup sdk.Application allows users to pair with silentShard app and mint their smart contact account and create transactions on blockchain.

### Project architecture
AA-FRONTEND
```
-README.md                 
-src/
    -app/
        -setup/
            -introPage
            -mint
            -pair
            -layout.tsx
        - homescreen/
        - layout.tsx
        - page.tsx
    - components/
    - utils/
- public/

```   


## How to run
1. `npm install`
2. `npm run dev` to run dev version

or if you're using `Yarn`

1. `yarn`
2. `yarn dev` to run dev version

Once started, the app is running on http://localhost:3000/

## Screenshots
Intro 
![Intro](./public/intropage.png)

Pair 
![Pair](./public/pair2.png)

Mint
![mint](./public/mint.png)

Transaction 
![Homescreen](./public/transaction.png)