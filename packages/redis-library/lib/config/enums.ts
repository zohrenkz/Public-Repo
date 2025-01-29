export enum PersistenceMode {
    NONE = 'none',
    RDB = 'rdb',
    AOF = 'aof'
};

export interface  PersistenceInterface {
    [PersistenceMode.NONE]: { save: string, appendonly: string, message: string };
    [PersistenceMode.RDB]: { save: string, appendonly: string, message: string };
    [PersistenceMode.AOF]: { save: string, appendonly: string, message: string };
};