// ================================================
// DEMO ONLY: Dummy data for pitching to customers.
// REMOVE THIS LATER once real restaurants onboarded.
// ================================================

export const DEMO_RESTAURANT = {
  name: "CulinaryCanvas Demo",
  slug: "demo",
};

export const DEMO_MENU = [
  {
    _id: "cat1",
    name: "Signature Dishes",
    items: [
      {
        _id: "item1",
        name: "Harvest Grain Bowl",
        description: "Organic quinoa, roasted seasonal vegetables, and lemon-tahini dressing.",
        price: 450,
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80",
        isAvailable: true
      },
      {
        _id: "item2",
        name: "Wild Mushroom Pizza",
        description: "Truffle cream base, porcini mushrooms, and fresh buffalo mozzarella.",
        price: 680,
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80",
        isAvailable: true
      }
    ]
  },
  {
    _id: "cat2",
    name: "Desserts",
    items: [
      {
        _id: "item3",
        name: "Midnight Cocoa Fondant",
        description: "70% Valrhona dark chocolate with a warm molten core.",
        price: 380,
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80",
        isAvailable: true
      }
    ]
  },
  {
    _id: "cat3",
    name: "Cocktails",
    items: [
      {
        _id: "item4",
        name: "Hibiscus Negroni",
        description: "Gin infused with hibiscus flowers, campari, and orange bitters.",
        price: 520,
        image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=500&q=80",
        isAvailable: true
      }
    ]
  }
];

export const DEMO_ORDER = {
  _id: "demo_order_id_6789",
  restaurantId: { name: "CulinaryCanvas Demo", slug: "demo" },
  items: [
    { name: "Harvest Grain Bowl", price: 450, quantity: 1 },
    { name: "Hibiscus Negroni", price: 520, quantity: 2 }
  ],
  totalAmount: 1564, // (450 + 1040) * 1.05
  status: "preparing",
  createdAt: new Date().toISOString()
};
