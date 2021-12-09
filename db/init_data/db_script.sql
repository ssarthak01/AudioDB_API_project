DROP TABLE IF EXISTS artist_reviews
CASCADE;
CREATE TABLE
IF NOT EXISTS artist_reviews
(
  id SERIAL PRIMARY KEY,      
  artist VARCHAR
(50) NOT NULL,
  review VARCHAR
(1000), 
  review_date DATE NOT NULL  
);