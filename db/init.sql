CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  category VARCHAR(100),
  image_emoji VARCHAR(10)
);

CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id),
  product_id BIGINT REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL
);

INSERT INTO products (name, description, price, stock_quantity, category, image_emoji) VALUES
('Pro Running Shoes', 'Lightweight, breathable running shoes with cushioned sole and arch support. Perfect for marathon training.', 129.99, 50, 'Running', '👟'),
('Running Compression Socks', 'High-performance compression socks that reduce fatigue and improve circulation during long runs.', 24.99, 120, 'Running', '🧦'),
('GPS Running Watch', 'Advanced GPS watch with heart rate monitor, pace tracking, and 30-hour battery life.', 249.99, 30, 'Running', '⌚'),
('Reflective Running Vest', 'Lightweight reflective safety vest with pockets for night running. One size fits most.', 34.99, 75, 'Running', '🦺'),
('Basketball', 'Official size and weight indoor/outdoor basketball with deep channel design for better grip.', 49.99, 60, 'Basketball', '🏀'),
('Basketball Shoes', 'High-top basketball shoes with ankle support and non-slip court sole. Available in multiple sizes.', 109.99, 45, 'Basketball', '👟'),
('Basketball Knee Pads', 'Professional knee pads with gel padding and breathable fabric for court protection.', 29.99, 80, 'Basketball', '🦵'),
('Soccer Ball', 'FIFA-approved match ball with thermally bonded panels for consistent flight and waterproof coating.', 39.99, 90, 'Soccer', '⚽'),
('Soccer Cleats', 'Firm ground soccer cleats with molded studs for superior traction on natural grass surfaces.', 89.99, 55, 'Soccer', '👞'),
('Soccer Shin Guards', 'Lightweight shin guards with ankle sleeve and foam backing for maximum protection and comfort.', 19.99, 100, 'Soccer', '🦵'),
('Swim Goggles', 'Anti-fog, UV-protected swim goggles with adjustable nose bridge and silicone seal for watertight fit.', 22.99, 85, 'Swimming', '🥽'),
('Swim Cap', 'Premium silicone swim cap that reduces drag and protects hair from chlorine damage.', 14.99, 110, 'Swimming', '🎽'),
('Training Fins', 'Short blade training fins to improve kick technique and build leg strength. Sold as a pair.', 44.99, 40, 'Swimming', '🌊'),
('Tennis Racket', 'Mid-plus head tennis racket with graphite frame, perfect for intermediate to advanced players.', 79.99, 35, 'Tennis', '🎾'),
('Tennis Balls', 'Pressurized tennis balls with durable felt cover. Pack of 4, suitable for all court surfaces.', 12.99, 200, 'Tennis', '🎾'),
('Tennis Wristbands', 'Absorbent cotton wristbands that keep hands dry during intense matches. Pack of 2.', 9.99, 150, 'Tennis', '💪'),
('Yoga Mat', 'Extra thick 6mm non-slip yoga mat with carrying strap. Eco-friendly TPE material.', 54.99, 65, 'Fitness', '🧘'),
('Resistance Bands Set', 'Set of 5 resistance bands with varying tension levels for full-body strength training.', 32.99, 95, 'Fitness', '💪'),
('Adjustable Dumbbells', 'Space-saving adjustable dumbbells ranging from 5 to 52.5 lbs. Quick-change weight selector.', 299.99, 20, 'Fitness', '🏋️'),
('Jump Rope', 'Speed jump rope with ball-bearing handles and adjustable length. Perfect for cardio and CrossFit.', 18.99, 130, 'Fitness', '🪢');
