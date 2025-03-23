import { Controller, Get, Query, Param, Body, Post, Put, Delete, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UsersService } from "../user.service";
import { CreateEmployeeDto, UpdateEmployeeDto } from "../dtos/index";

@ApiTags("employees")
@Controller("api/v1/employees")
export class EmployeeController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOperation({ summary: "Search employees" })
    @Get("search")
    searchEmployees(
        @Query("query") query: string = "",
        @Query("page") page: number = 1,
        @Query("limit") limit: number = 10,
        @Query("sortField") sortField: string = "name",
        @Query("sortOrder") sortOrder: "asc" | "desc" = "asc"
    ) {
        return this.usersService.searchEmployees(query, page, limit, sortField, sortOrder);
    }

    @ApiOperation({ summary: "Get all employees" })
    @Get()
    getAllEmployees() {
        return this.usersService.getAllEmployees();
    }

    @ApiOperation({ summary: "Get an employee by MongoDB _id" })
    @ApiParam({ name: "_id", description: "Employee MongoDB _id" })
    @Get(":_id")
    getEmployeeById(@Param("_id") id: string) {
        return this.usersService.getEmployeeById(id);
    }

    @ApiOperation({ summary: "Create a new employee" })
    @ApiBody({ type: CreateEmployeeDto })
    @Post()
    @HttpCode(HttpStatus.CREATED)
    createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
        return this.usersService.createEmployee(createEmployeeDto);
    }

    @ApiOperation({ summary: "Update an existing employee by _id" })
    @ApiParam({ name: "_id", description: "Employee MongoDB _id" })
    @ApiBody({ type: UpdateEmployeeDto })
    @Put(":_id")
    updateEmployee(@Param("_id") id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
        return this.usersService.updateEmployee(id, updateEmployeeDto);
    }

    @ApiOperation({ summary: "Delete an employee by _id" })
    @ApiParam({ name: "_id", description: "Employee MongoDB _id" })
    @Delete(":_id")
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteEmployee(@Param("_id") id: string) {
        return this.usersService.deleteEmployee(id);
    }
}
