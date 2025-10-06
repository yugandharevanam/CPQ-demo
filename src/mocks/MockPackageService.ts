import { Package, InteriorOption } from '../types';
import ambianceImg from '../Assets/Ambiance.jpg';
import paintedModularImg from '../Assets/Painted + Modular.jpg';
import stainlessSteelImg from '../Assets/Stainless Steel.jpg';

// Helper to convert array items to InteriorOption with IDs
const toInteriorOptions = (items: Array<any>, prefix: string): InteriorOption[] => {
  return items.map((it, idx) => ({
    id: `${prefix}-${idx + 1}`,
    name: it.name,
    primaryImage: it.primaryImage,
    cabViewImage: it.cabViewImage,
    lobbyViewImage: it.lobbyViewImage,
    price: Number(it.price) || 0,
    image: it.primaryImage
  }));
};

// Hardcoded mock taken from user-provided data
const rawPackages = [
  {
    id: 'PKG-AMBIANCE',
    name: 'Ambiance',
    description: '<div><ol><li><strong>Wall Material</strong>: Wooden Panel</li><li><strong>Handrail Position</strong>: 3 sided</li><li><strong>Handrail Finish</strong>: Golden Steel</li><li>Elegant wooden panel finish</li></ol></div>',
    image: ambianceImg,
    features: {
      wallMaterial: 'Wooden Panel',
      handrailPosition: '3 sided',
      handrailBarFinish: 'Golden Steel'
    },
    custom_data: [
      { name: 'Majestic Mahogany', primaryImage: '/files/finishes/wood/majestic-mahogany.jpg', cabViewImage: '/files/finishes/wood/majestic-mahogany-cab.jpg', lobbyViewImage: '/files/finishes/wood/majestic-mahogany-lobby.jpg', price: 0 },
      { name: 'River of the Night', primaryImage: '/files/finishes/wood/river-night.jpg', cabViewImage: '/files/finishes/wood/river-night-cab.jpg', lobbyViewImage: '/files/finishes/wood/river-night-lobby.jpg', price: 0 },
      { name: 'Oak Elegance', primaryImage: '/files/finishes/wood/oak-elegance.jpg', cabViewImage: '/files/finishes/wood/oak-elegance-cab.jpg', lobbyViewImage: '/files/finishes/wood/oak-elegance-lobby.jpg', price: 22000 },
      { name: 'Walnut Premium', primaryImage: '/files/finishes/wood/walnut-premium.jpg', cabViewImage: '/files/finishes/wood/walnut-premium-cab.jpg', lobbyViewImage: '/files/finishes/wood/walnut-premium-lobby.jpg', price: 35000 }
    ],
    custom_elevator_door_finishes: [
      { name: 'Golden Steel', primaryImage: '/files/finishes/doors/golden-steel.jpg', cabViewImage: '/files/finishes/doors/golden-steel-cab.jpg', lobbyViewImage: '/files/finishes/doors/golden-steel-lobby.jpg', price: 0 },
      { name: 'Rose Gold', primaryImage: '/files/finishes/doors/rose-gold.jpg', cabViewImage: '/files/finishes/doors/rose-gold-cab.jpg', lobbyViewImage: '/files/finishes/doors/rose-gold-lobby.jpg', price: 18500 },
      { name: 'Bronze Luxury', primaryImage: '/files/finishes/doors/bronze-luxury.jpg', cabViewImage: '/files/finishes/doors/bronze-luxury-cab.jpg', lobbyViewImage: '/files/finishes/doors/bronze-luxury-lobby.jpg', price: 28000 }
    ]
  },
  {
    id: 'PKG-PAINTED-MODULAR',
    name: 'Painted + Modular',
    description: '<div><ol><li><strong>Wall Material</strong>: Painted</li><li><strong>Handrail Position</strong>: 3 sided \u00a0</li><li><strong>Handrail Finish</strong>: Satin Steel</li><li>Classic painted finish with modular handrail design</li></ol></div>',
    image: paintedModularImg,
    features: {
      wallMaterial: 'Painted',
      handrailPosition: '3 sided',
      handrailBarFinish: 'Satin Steel'
    },
    custom_data: [
      { name: 'Radiant Russet', primaryImage: '/files/finishes/painted/radiant-russet.jpg', cabViewImage: '/files/finishes/painted/radiant-russet-cab.jpg', lobbyViewImage: '/files/finishes/painted/radiant-russet-lobby.jpg', price: 0 },
      { name: 'Moonlight Magic', primaryImage: '/files/finishes/painted/moonlight-magic.jpg', cabViewImage: '/files/finishes/painted/moonlight-magic-cab.jpg', lobbyViewImage: '/files/finishes/painted/moonlight-magic-lobby.jpg', price: 0 },
      { name: 'Cream Delight', primaryImage: '/files/finishes/painted/cream-delight.jpg', cabViewImage: '/files/finishes/painted/cream-delight-cab.jpg', lobbyViewImage: '/files/finishes/painted/cream-delight-lobby.jpg', price: 0 }
    ],
    custom_elevator_door_finishes: [
      { name: 'Pearl', primaryImage: '/files/finishes/doors/pearl.jpg', cabViewImage: '/files/finishes/doors/pearl-cab.jpg', lobbyViewImage: '/files/finishes/doors/pearl-lobby.jpg', price: 0 }
    ]
  },
  {
    id: 'PKG-STAINLESS-STEEL',
    name: 'Stainless Steel',
    description: '<div><ol><li><strong>Wall Material</strong>: Stainless Steel</li><li><strong>Handrail Position</strong>: 3 sided</li><li><strong>Handrail Finish</strong>: Mirror Steel</li><li>Premium stainless steel finish</li></ol></div>',
    image: stainlessSteelImg,
    features: {
      wallMaterial: 'Stainless Steel',
      handrailPosition: '3 sided',
      handrailBarFinish: 'Mirror Steel'
    },
    custom_data: [
      { name: 'Mirror Steel', primaryImage: '/files/finishes/steel/mirror-steel.jpg', cabViewImage: '/files/finishes/steel/mirror-steel-cab.jpg', lobbyViewImage: '/files/finishes/steel/mirror-steel-lobby.jpg', price: 0 },
      { name: 'Hairline Steel', primaryImage: '/files/finishes/steel/hairline-steel.jpg', cabViewImage: '/files/finishes/steel/hairline-steel-cab.jpg', lobbyViewImage: '/files/finishes/steel/hairline-steel-lobby.jpg', price: 0 },
      { name: 'Brushed Steel', primaryImage: '/files/finishes/steel/brushed-steel.jpg', cabViewImage: '/files/finishes/steel/brushed-steel-cab.jpg', lobbyViewImage: '/files/finishes/steel/brushed-steel-lobby.jpg', price: 15000 }
    ],
    custom_elevator_door_finishes: [
      { name: 'Mirror Door', primaryImage: '/files/finishes/doors/mirror-door.jpg', cabViewImage: '/files/finishes/doors/mirror-door-cab.jpg', lobbyViewImage: '/files/finishes/doors/mirror-door-lobby.jpg', price: 0 },
      { name: 'Gold Mirror', primaryImage: '/files/finishes/doors/gold-mirror.jpg', cabViewImage: '/files/finishes/doors/gold-mirror-cab.jpg', lobbyViewImage: '/files/finishes/doors/gold-mirror-lobby.jpg', price: 25000 },
      { name: 'Titanium Finish', primaryImage: '/files/finishes/doors/titanium-finish.jpg', cabViewImage: '/files/finishes/doors/titanium-finish-cab.jpg', lobbyViewImage: '/files/finishes/doors/titanium-finish-lobby.jpg', price: 18500 }
    ]
  }
];

const packages: Package[] = rawPackages.map((p) => {
  // Default price settings
  let price = 0;
  let isIncluded = false;

  // Set prices as per requested format
  if (p.id === 'PKG-PAINTED-MODULAR') {
    price = 0;
    isIncluded = true; // Included
  } else if (p.id === 'PKG-STAINLESS-STEEL') {
    price = 25000;
    isIncluded = false;
  } else if (p.id === 'PKG-AMBIANCE') {
    price = 45000;
    isIncluded = false;
  }

  return {
    id: p.id,
    name: p.name,
    description: p.description,
    image: p.image,
    price,
    isIncluded,
    features: p.features,
    interiorOptions: {
      cabFinishes: toInteriorOptions(p.custom_data, `${p.id}-cab`),
      elevatorDoorFinishes: toInteriorOptions(p.custom_elevator_door_finishes, `${p.id}-door`)
    }
  } as Package;
});

export const MockPackageService = {
  async getPackagesForProduct(_productId: string): Promise<Package[]> {
    await new Promise(r => setTimeout(r, 150));
    return packages;
  }
};


