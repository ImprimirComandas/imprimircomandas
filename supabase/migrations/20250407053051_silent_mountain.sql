/*
  # Create comandas table

  1. New Tables
    - `comandas`
      - `id` (uuid, primary key)
      - `produtos` (jsonb array of products)
      - `total` (decimal)
      - `forma_pagamento` (text)
      - `data` (timestamp with time zone)
      - `endereco` (text)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `comandas` table
    - Add policies for authenticated users to read and insert their own data
*/

CREATE TABLE IF NOT EXISTS comandas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produtos jsonb NOT NULL,
  total decimal(10,2) NOT NULL,
  forma_pagamento text NOT NULL,
  data timestamptz NOT NULL,
  endereco text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comandas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own comandas"
  ON comandas
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert comandas"
  ON comandas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);