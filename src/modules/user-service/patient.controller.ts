import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { CreatePatientDto, UpdatePatientDto } from "./dtos/patient.dto"
import { UsersService } from "./user.service"
import { Patient } from "./schemas"

@ApiTags("Patients")
@Controller("api/v1/patients")
export class PatientController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    async getAllPatients(): Promise<Patient[]> {
        return await this.usersService.getAllPatients()
    }

    @Get(":id") 
    async getPatientById(@Param("id") id: string): Promise<Patient> {
        return await this.usersService.getPatientById(id)
    }

    @Post()
    async createPatient(@Body() createPatientDto: CreatePatientDto): Promise<Patient> {
        return await this.usersService.createPatient(createPatientDto)
    }

    @Put(":id")
    async updatePatient(@Param("id") id: string, @Body() updatePatientDto: UpdatePatientDto): Promise<Patient> {
        return await this.usersService.updatePatient(id, updatePatientDto)
    }

    @Delete(":id")
    async deletePatient(@Param("id") id: string): Promise<void> {
        return await this.usersService.deletePatient(id)
    }
}
