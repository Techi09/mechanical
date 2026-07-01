import { Redis } from '@upstash/redis';

// This automatically connects using the KV_REST_API_URL and KV_REST_API_TOKEN environment variables
const kv = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. GET Request: Read reviews
    if (req.method === 'GET') {
      const reviews = await kv.get('matrix_reviews') || [];
      return res.status(200).json(reviews);
    }

    // 2. POST Request: Append review
    if (req.method === 'POST') {
      const newReview = req.body;
      if (!newReview.text) {
        return res.status(400).json({ error: "Review text cannot be empty." });
      }

      const currentReviews = await kv.get('matrix_reviews') || [];
      currentReviews.push(newReview);
      
      await kv.set('matrix_reviews', currentReviews);
      return res.status(201).json({ success: true, reviews: currentReviews });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}