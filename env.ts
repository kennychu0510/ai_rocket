import { config } from 'dotenv'
import populateEnv from 'populate-env'

config()

export const env = {
    DB_NAME: '',
    DB_USER: '',
    DB_PASSWORD: ''
}

populateEnv(env)
