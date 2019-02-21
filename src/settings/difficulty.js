const NORMAL = {
    PLAYER_STATS = {
        HEALTH: 100,                        // Current health value
        MAX_HEALTH: 100,                    // Maximum health value 
        ARMOR: 100,                         // Current armor value
        MAX_ARMOR: 100,                     // Maximum armor value
        DAMAGE: 15,                         // Damage caused by the player
        KEYCODES : [false, false, false],   // Collected Key Codes: true = collected; false = not collected yet
        FIRE_RATE: 250,                     // Fire rate
        LASER_SPEED: 2,                     // Laser speed
        ARMOR_RECOVERY_TIMER: 3000,         // Time untile armor recovery begins when player is unharmed
        TIME_RECOVER_ARMOR: 250,            // Time until armor recovers the armor recovery value
        ARMOR_RECOVERY: 5                   // Armor recovery value per time unit
    }
};

const EASY = {
    PLAYER_STATS = {
        HEALTH: 150,                        // Current health value
        MAX_HEALTH: 150,                    // Maximum health value 
        ARMOR: 150,                         // Current armor value
        MAX_ARMOR: 150,                     // Maximum armor value
        DAMAGE: 25,                         // Damage caused by the player
        KEYCODES : [false, false, false],   // Collected Key Codes: true = collected; false = not collected yet
        FIRE_RATE: 250,                     // Fire rate
        LASER_SPEED: 2,                     // Laser speed
        ARMOR_RECOVERY_TIMER: 2000,         // Time untile armor recovery begins when player is unharmed
        TIME_RECOVER_ARMOR: 200,            // Time until armor recovers the armor recovery value
        ARMOR_RECOVERY: 5                   // Armor recovery value per time unit
    }
};

const HARD = {
    PLAYER_STATS = {
        HEALTH: 80,                        // Current health value
        MAX_HEALTH: 80,                    // Maximum health value 
        ARMOR: 80,                         // Current armor value
        MAX_ARMOR: 80,                     // Maximum armor value
        DAMAGE: 10,                         // Damage caused by the player
        KEYCODES : [false, false, false],   // Collected Key Codes: true = collected; false = not collected yet
        FIRE_RATE: 250,                     // Fire rate
        LASER_SPEED: 2,                     // Laser speed
        ARMOR_RECOVERY_TIMER: 4000,         // Time untile armor recovery begins when player is unharmed
        TIME_RECOVER_ARMOR: 250,            // Time until armor recovers the armor recovery value
        ARMOR_RECOVERY: 5                   // Armor recovery value per time unit
    }
};