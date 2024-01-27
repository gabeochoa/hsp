class Constants {
  max_energy: number = 100;
  max_health: number = 100;
  max_cards_new_arrivals = 3;
  max_cards = 5;

  starting_medicine: number = 500;

  // These are just the top names from 1923-now in the us
  names = [
    'James',
    'Mary',
    'Robert',
    'Patricia',
    'John',
    'Jennifer',
    'Michael',
    'Linda',
    'David',
    'Elizabeth',
    'William',
    'Barbara',
    'Richard',
    'Susan',
    'Joseph',
    'Jessica',
    'Thomas',
    'Sarah',
    'Christopher',
    'Karen',
    'Charles',
    'Lisa',
    'Daniel',
    'Nancy',
    'Matthew',
    'Betty',
    'Anthony',
    'Sandra',
    'Mark',
    'Margaret',
  ];
}

class Variables {
  max_medicine_needed: number = 1;
  max_ticks_needed: number = 50;

  // Ticks
  burial_time: number = 50;
  new_arrival_spawn_rate: number = 50;
}

export const constants = new Constants();
export const variables = new Variables();
