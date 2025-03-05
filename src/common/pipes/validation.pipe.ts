import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from "@nestjs/common"
import { plainToInstance } from "class-transformer"
import { validate } from "class-validator"

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
    async transform(value: any, { metatype }: ArgumentMetadata) {
        if (!metatype || !this.toValidate(metatype)) {
            return value
        }
        const object = plainToInstance(metatype, value)
        const errors = await validate(object)

        if (errors.length > 0) {
            throw new HttpException(`Form Arguments invalid: ${this.formatErrors(errors)}`, HttpStatus.BAD_REQUEST, {
                cause: { code: this.formatErrors(errors) }
            })
        }

        return value
    }

    private toValidate(metatype: any): boolean {
        const types: any[] = [String, Boolean, Number, Array, Object]
        return !types.includes(metatype)
    }

    private formatErrors(errors: any[]): string {
        return errors.map((err) => {
            let error: string = ""

            // eslint-disable-next-line no-restricted-syntax, guard-for-in, no-unreachable-loop
            for (const property in err.constraints) {
                error += err.constraints[property]
            }

            if (err.children.length) {
                error += this.formatErrors(err.children)
            }

            return error
        })[0]
    }
}
