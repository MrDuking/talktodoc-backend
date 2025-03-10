import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { CreateDoctorDto, UpdateDoctorDto } from "./dtos/doctor.dto"
import { UsersService } from "./user.service"

@ApiTags("Doctors")
@Controller("api/v1/doctors")
export class DoctorController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    async getAllDoctors() {
        return await this.usersService.getAllDoctors()
    }

    @Get(":id")
    async getDoctorById(@Param("id") id: string) {
        return await this.usersService.getDoctorById(id)
    }

    @Post()
    async createDoctor(@Body() createDoctorDto: CreateDoctorDto) {
        return await this.usersService.createDoctor(createDoctorDto)
    }

    @Put(":id")
    async updateDoctor(@Param("id") id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
        return await this.usersService.updateDoctor(id, updateDoctorDto)
    }

    @Delete(":id")
    async deleteDoctor(@Param("id") id: string) {
        return await this.usersService.deleteDoctor(id)
    }
}
