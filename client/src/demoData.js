// DEMO ONLY: This file contains dummy data for pitching to customers.
// REMOVE THIS LATER once real restaurants are onboarded.

export const DEMO_RESTAURANT = {
  name: "The Curry Leaf (Demo)",
  slug: "demo",
};

export const DEMO_MENU = [
  {
    _id: "cat1",
    name: "Tandoori Starters",
    items: [
      {
        _id: "item1",
        name: "Paneer Tikka Mastani",
        description: "Soft paneer cubes marinated in authentic Indian spices and grilled to perfection.",
        price: 249,
        image: "https://images.unsplash.com/photo-1599487488170-d11ec9c175f0?auto=format&fit=crop&w=500&q=80",
        isAvailable: true
      },
      {
        _id: "item2",
        name: "Hara Bhara Kebab",
        description: "Classic green patties made with spinach, peas, and potatoes served with mint chutney.",
        price: 180,
        image: "https://images.unsplash.com/photo-1589187151003-0dd3c63ef53e?auto=format&fit=crop&w=500&q=80",
        isAvailable: true
      }
    ]
  },
  {
    _id: "cat2",
    name: "Main Course",
    items: [
      {
        _id: "item3",
        name: "Dal Makhani (Classic)",
        description: "Slow-cooked black lentils in creamy tomato gravy with a dollop of white butter.",
        price: 320,
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80",
        isAvailable: true
      }
    ]
  },
  {
    _id: "cat3",
    name: "Breads & Lassi",
    items: [
      {
        _id: "item4",
        name: "Kulhad Lassi",
        description: "Traditional thick yogurt drink served sweet with a thick layer of malai.",
        price: 99,
        image: "https://images.unsplash.com/photo-1549413203-0498b584090b?auto=format&fit=crop&w=500&q=80",
        isAvailable: true
      }
    ]
  }
];

export const DEMO_ORDER = {
  _id: "demo_order_id_6789",
  restaurantId: { name: "The Curry Leaf (Demo)", slug: "demo" },
  items: [
    { name: "Paneer Tikka Mastani", price: 249, quantity: 1 },
    { name: "Kulhad Lassi", price: 99, quantity: 2 }
  ],
  totalAmount: 469, // Approx calculation
  status: "preparing",
  createdAt: new Date().toISOString()
};
