import bcrypt from "bcryptjs";

// bcrypt does two things for us:
//   hash()    -> turns a plain password into irreversible gibberish to store
//   compare() -> checks a plain password against stored gibberish, without
//                ever "un-hashing" it (that's not actually possible -- it's
//                one-way by design)
//
// The number 10 below is the "cost factor" -- how many times bcrypt loops
// internally. Higher = slower to compute = harder to brute-force, but also
// slower for real logins. 10 is a solid, standard default.
const SALT_ROUNDS = 10;

export function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export function comparePassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}
