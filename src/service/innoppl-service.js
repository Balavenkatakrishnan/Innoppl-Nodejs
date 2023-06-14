
const { db, pgpHelpers } = require('../db-config/db-postgres')
const _ = require("lodash")
const jwt = require('jsonwebtoken');

const EmployeeAllocationInsertColumn = ['empid', 'projectid', 'employeename', 'projectname','departmentid','departmentname']
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

async function getDepartments() {
    let department = await db.manyOrNone(`Select name as label ,id as value from innoppl.department`);
    return JSON.stringify(department)
}

async function postEmployeeAllocation(empid, projectid,departmentid) {
    if (!_.isEmpty(projectid)&& !_.isEmpty(departmentid)) {
        await Promise.all(
            projectid.map(async (projectid) => {
                
                for (const departmentval of departmentid) {
                    const employeeAlreadyExists = await db.oneOrNone(`select exists(select id from innoppl.employeeprojectallocation where empid=$[empid] and projectid =$[projectid] and departmentid in ($[departmentid]))`, { empid, projectid,departmentid:departmentval })
                    if (!employeeAlreadyExists.exists) {
                        let employee = await db.oneOrNone(`select name from innoppl.employee where id=$[empid]`, { empid })
                        let project = await db.oneOrNone(`select name from innoppl.departmentorproject where id = $[projectid]`, { projectid })
                        let department = await db.oneOrNone(`select name from innoppl.department where id = $[departmentid]`, { departmentid:departmentval })
                        let postEmployeeAllocationInsert = {}
                        postEmployeeAllocationInsert.empid = empid;
                        postEmployeeAllocationInsert.projectid = projectid;
                        postEmployeeAllocationInsert.employeename = employee.name;
                        postEmployeeAllocationInsert.projectname = project.name;
                        postEmployeeAllocationInsert.departmentid = departmentval;
                        postEmployeeAllocationInsert.departmentname = department.name;
    
                        const employeeAllocationQuery = pgpHelpers.insert(postEmployeeAllocationInsert, employeeProjectAllocationColumnSet)
                        await db.none(employeeAllocationQuery)
                    }
                 }
               
            })
        )
    } else {
        return { result: 'Failed' }
    }
    return { result: 'Processed' }

}

// async function postAutherization(email, password) {

    
//     let validData = await db.oneOrNone(`select exists(select email from innoppl.authentication where email=$[email] and password =$[password])`, { email, password })
//     if (validData.exists) {
//         return { result: 'Processed' }
//     } else {
//         return { result: 'Failed' }
//     }

// }

async function getEmployeeAllocation(){
    let employeeAllocationData=await db.manyOrNone(`SELECT empid,Employeename, ARRAY_AGG(DISTINCT projectid)As project_ids,ARRAY_AGG(DISTINCT projectname) As project_name,ARRAY_AGG(DISTINCT departmentname) AS departmentname,ARRAY_AGG(DISTINCT departmentid) as departmentids
    FROM innoppl.employeeprojectallocation
    GROUP BY empid,Employeename order by empid`)
    return JSON.stringify(employeeAllocationData)
}


module.exports = {
    getEmployee,
    getProjects,
    postEmployeeAllocation,
    // postAutherization,
    getEmployeeAllocation,
    getDepartments
}

