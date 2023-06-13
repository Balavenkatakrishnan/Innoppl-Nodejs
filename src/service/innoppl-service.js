
const { db, pgpHelpers } = require('../db-config/db-postgres')
const _ = require("lodash")
const jwt = require('jsonwebtoken');

const EmployeeAllocationInsertColumn = ['empid', 'projectid', 'employeename', 'projectname']
const employeeProjectAllocationColumnSet = new pgpHelpers.ColumnSet(
    EmployeeAllocationInsertColumn, { table: { table: 'employeeprojectallocation', schema: 'innoppl' } }
)

async function getEmployee() {
    let employee = await db.manyOrNone(`Select name as label,id as value from innoppl.employee `);
    return JSON.stringify(employee)
}

async function getProjects() {
    let project = await db.manyOrNone(`Select name as label ,id as value from innoppl.departmentorproject `);
    return JSON.stringify(project)
}

async function postEmployeeAllocation(empid, projectid) {
    if (!_.isEmpty(projectid)) {
        await Promise.all(
            projectid.map(async (projectid) => {
                const employeeAlreadyExists = await db.oneOrNone(`select exists(select id from innoppl.employeeprojectallocation where empid=$[empid] and projectid =$[projectid])`, { empid, projectid })
                if (!employeeAlreadyExists.exists) {
                    let employee = await db.oneOrNone(`select name from innoppl.employee where id=$[empid]`, { empid })
                    let project = await db.oneOrNone(`select name from innoppl.departmentorproject where id = $[projectid]`, { projectid })
                    let postEmployeeAllocationInsert = {}
                    postEmployeeAllocationInsert.empid = empid;
                    postEmployeeAllocationInsert.projectid = projectid;
                    postEmployeeAllocationInsert.employeename = employee.name;
                    postEmployeeAllocationInsert.projectname = project.name;
                    const employeeAllocationQuery = pgpHelpers.insert(postEmployeeAllocationInsert, employeeProjectAllocationColumnSet)
                    await db.none(employeeAllocationQuery)
                }
            })
        )
    } else {
        return { result: 'Failed' }
    }
    return { result: 'Processed' }

}

async function postAutherization(email, password) {

    const payload = { email: email };
    const secretKey =password;
    const token = jwt.sign(payload, secretKey);
    console.log(token)
    
    let validData = await db.oneOrNone(`select exists(select email from innoppl.authentication where email=$[email] and password =$[password])`, { email, password })
    if (validData.exists) {
        return { result: 'Processed' }
    } else {
        return { result: 'Failed' }
    }

}


module.exports = {
    getEmployee,
    getProjects,
    postEmployeeAllocation,
    postAutherization
}

