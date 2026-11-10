-- Free games never carry a price, and paid games always have one.
-- The new-game form used to save its default $12 on games set to Free, and
-- accepted $0 "pay now" games that nobody could join.

-- Pay-later games at $0 become free: settle their open reservations first.
UPDATE "Registration" r
SET "status" = 'CONFIRMED', "payStatus" = 'FREE', "offerExpiresAt" = NULL
FROM "Game" g
WHERE r."gameId" = g."id"
  AND g."model" IN ('PAY', 'LATER') AND g."priceCents" <= 0
  AND r."status" = 'PROVISIONAL' AND r."payStatus" = 'UNPAID';

UPDATE "Registration" r
SET "payStatus" = 'FREE'
FROM "Game" g
WHERE r."gameId" = g."id"
  AND g."model" IN ('PAY', 'LATER') AND g."priceCents" <= 0
  AND r."status" IN ('OFFERED', 'WAITLISTED') AND r."payStatus" = 'UNPAID';

UPDATE "Game" SET "model" = 'FREE', "priceCents" = 0
WHERE "model" IN ('PAY', 'LATER') AND "priceCents" <= 0;

UPDATE "Game" SET "priceCents" = 0
WHERE "model" = 'FREE' AND "priceCents" <> 0;

UPDATE "RecurringEventSeries" SET "model" = 'FREE', "priceCents" = 0
WHERE "model" IN ('PAY', 'LATER') AND "priceCents" <= 0;

UPDATE "RecurringEventSeries" SET "priceCents" = 0
WHERE "model" = 'FREE' AND "priceCents" <> 0;
