_View Live:_
https://verum-blockchain.vercel.app/

**How to Deploy:**
1. Copy Git repo
2. Create environment variables as follows:
  1. NEXT_PUBLIC_API_URL=http://localhost:3000/api/graphql
  2. INCH_API_URL=https://api.1inch.io/v5.0/
  3. LIMIT_ORDER_URL=https://limit-orders.1inch.io/v3.0/
  4. SUPABASE_URL
  5. SUPABASE_PUBLIC_KEY
3. Run ```npm run dev``` to run in development environment.
4. To deploy production, use Netlify/Vercel.
5. Make sure to change the NEXT_PUBLIC_API_URL to your domain.

