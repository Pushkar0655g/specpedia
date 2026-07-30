const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Image placeholders (using picsum for demo – replace with real image URLs later)
const getImage = (id) => `https://picsum.photos/seed/${id}/400/300`;

// Product generators per category
const generateProducts = () => {
  const categories = [
    { id: 1, name: 'Mobiles', count: 50, brands: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Google', 'Nothing', 'Vivo', 'Oppo'] },
    { id: 2, name: 'Laptops', count: 50, brands: ['Apple', 'Dell', 'Lenovo', 'HP', 'ASUS', 'Acer', 'MSI', 'Razer'] },
    { id: 3, name: 'Cars', count: 50, brands: ['Tesla', 'BMW', 'Mercedes', 'Audi', 'Toyota', 'Honda', 'Hyundai', 'Mahindra'] },
    { id: 4, name: 'Motorcycles', count: 50, brands: ['Harley-Davidson', 'Ducati', 'Honda', 'Yamaha', 'Kawasaki', 'Royal Enfield', 'KTM', 'Suzuki'] },
    { id: 5, name: 'Guns', count: 50, brands: ['Glock', 'Sig Sauer', 'Beretta', 'Smith & Wesson', 'Remington', 'Winchester', 'CZ', 'Benelli'] },
  ];

  const products = [];
  let id = 1;

  categories.forEach(cat => {
    for (let i = 1; i <= cat.count; i++) {
      const brand = cat.brands[i % cat.brands.length];
      let name, price, specs;

      switch(cat.id) {
        case 1: // Mobiles
          name = `${brand} ${['Pro Max', 'Ultra', 'Pro', 'Plus', 'Lite'][i % 5]} ${Math.floor(Math.random() * 10) + 1}`;
          price = Math.floor(Math.random() * 120000) + 15000;
          specs = {
            display: `${['6.1', '6.5', '6.7', '6.8', '6.9'][i % 5]}-inch OLED`,
            chip: `Snapdragon ${Math.floor(Math.random() * 9) + 1} Gen ${Math.floor(Math.random() * 3) + 1}`,
            battery: `${Math.floor(Math.random() * 2000) + 3000} mAh`,
            camera: `${Math.floor(Math.random() * 100) + 12}MP ${i % 2 === 0 ? 'Triple' : 'Dual'}`,
          };
          break;
        case 2: // Laptops
          name = `${brand} ${['Pro', 'XPS', 'ThinkPad', 'ZenBook', 'Swift'][i % 5]} ${Math.floor(Math.random() * 1000) + 100}`;
          price = Math.floor(Math.random() * 250000) + 50000;
          specs = {
            cpu: `Intel Core ${['i5', 'i7', 'i9', 'Ultra 7', 'Ultra 9'][i % 5]}`,
            ram: `${[8, 16, 32, 64][i % 4]}GB`,
            storage: `${[256, 512, 1024, 2048][i % 4]}GB SSD`,
            display: `${['13.3', '14', '15.6', '16'][i % 4]}-inch ${i % 2 === 0 ? 'OLED' : 'IPS'}`,
          };
          break;
        case 3: // Cars
          name = `${brand} ${['Model', 'Series', 'Class', 'A', 'SUV'][i % 5]} ${Math.floor(Math.random() * 100) + 1}`;
          price = Math.floor(Math.random() * 5000000) + 800000;
          specs = {
            engine: `${Math.floor(Math.random() * 2000) + 1000}cc ${i % 2 === 0 ? 'Petrol' : 'Diesel'}`,
            power: `${Math.floor(Math.random() * 300) + 100} bhp`,
            torque: `${Math.floor(Math.random() * 400) + 150} Nm`,
            transmission: i % 2 === 0 ? 'Automatic' : 'Manual',
          };
          break;
        case 4: // Motorcycles
          name = `${brand} ${['Street', 'Sport', 'Cruiser', 'Adventure', 'Dual'][i % 5]} ${Math.floor(Math.random() * 1000) + 100}`;
          price = Math.floor(Math.random() * 3000000) + 100000;
          specs = {
            engine: `${Math.floor(Math.random() * 1000) + 100}cc`,
            power: `${Math.floor(Math.random() * 150) + 20} bhp`,
            weight: `${Math.floor(Math.random() * 150) + 150} kg`,
            topSpeed: `${Math.floor(Math.random() * 100) + 150} km/h`,
          };
          break;
        case 5: // Guns
          name = `${brand} ${['Model', 'Series', 'Pro', 'Elite', 'Sport'][i % 5]} ${Math.floor(Math.random() * 1000) + 1}`;
          price = Math.floor(Math.random() * 500000) + 50000;
          specs = {
            caliber: `${['9mm', '.45 ACP', '.22 LR', '.308', '.223'][i % 5]}`,
            capacity: `${[10, 12, 15, 17, 20][i % 5]} rounds`,
            weight: `${(Math.random() * 2 + 0.5).toFixed(1)} kg`,
          };
          break;
      }

      products.push({
        id,
        name,
        description: `The ${name} is a premium ${cat.name.toLowerCase()} product with cutting-edge technology and exceptional performance.`,
        price: price,
        image_url: getImage(id),
        category_id: cat.id,
        specs: JSON.stringify(specs),
        created_at: new Date().toISOString(),
      });
      id++;
    }
  });

  return products;
};

async function seedProducts() {
  const products = generateProducts();
  console.log(`Generated ${products.length} products`);

  // Insert in batches of 25 to avoid Supabase limits
  const batchSize = 25;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const { error } = await supabase.from('items').insert(batch);
    if (error) {
      console.error('Error inserting batch:', error);
    } else {
      console.log(`Inserted batch ${i / batchSize + 1}`);
    }
  }

  console.log('✅ Seeding complete!');
}

seedProducts();