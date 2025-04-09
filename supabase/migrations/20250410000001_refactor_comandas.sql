
/*
  # Refactor comandas table

  1. Update Table
    - `comandas`
      - Add `user_id` column (uuid)
      - Add `bairro` column (text)
      - Add `taxaentrega` column (decimal)
      - Add `pago` column (boolean)
      - Add `quantiapaga` column (decimal, nullable)
      - Add `troco` column (decimal, nullable)

  2. Update security policies
    - Update RLS policies to use user_id for row-level security
*/

-- First add the missing columns to the comandas table
ALTER TABLE comandas 
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS bairro text NOT NULL DEFAULT 'Jardim Paraíso',
  ADD COLUMN IF NOT EXISTS taxaentrega decimal(10,2) NOT NULL DEFAULT 6.00,
  ADD COLUMN IF NOT EXISTS pago boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS quantiapaga decimal(10,2),
  ADD COLUMN IF NOT EXISTS troco decimal(10,2);

-- Update RLS policies to use user_id
DROP POLICY IF EXISTS "Users can read their own comandas" ON comandas;
CREATE POLICY "Users can read their own comandas"
  ON comandas
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert comandas" ON comandas;
CREATE POLICY "Users can insert comandas"
  ON comandas
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- New policy to allow users to update their own comandas
CREATE POLICY IF NOT EXISTS "Users can update their own comandas"
  ON comandas
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- New policy to allow users to delete their own comandas
CREATE POLICY IF NOT EXISTS "Users can delete their own comandas"
  ON comandas
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
