import * as path from 'path'
import * as dotenv from 'dotenv'

export function config(name = 'test'): dotenv.DotenvConfigOutput {
    return dotenv.config({
        path: path.join(path.dirname(__dirname), `${name}.env`),
    })
}
