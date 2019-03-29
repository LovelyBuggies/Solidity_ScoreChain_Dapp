pragma solidity >=0.4.20 <0.6.1;

contract Score {
    // Model a Student
    struct Student {
        uint id;
        string name;
        uint scoredTimes;
        uint scoredSum;
    }

    // Store accounts that have selected
    mapping(address => bool) public TAs;
    // Store Students
    // Fetch Student
    mapping(uint => Student) public students;
    // Store Students Count
    uint public studentsNum;

    // selected event
    event selectedEvent (
        uint indexed _studentId,
        uint _scoredVal
    );

    constructor() public {
        addStudent("Alex");
        addStudent("Bobby");
        addStudent("Cinderalla");
        addStudent("Mary");
        addStudent("Nino");
        addStudent("Sara");
    }

    function addStudent (string _name) private {
        studentsNum ++;
        students[studentsNum] = Student(studentsNum, _name, 0, 0);
    }

    function select (uint _studentId, uint _scoredVal) public {

        // require a valid student
        require(_studentId > 0 && _studentId <= studentsNum && _scoredVal > 0 && _scoredVal <= 100);

        // record that selecter has selected
        TAs[msg.sender] = true;

        // update student select Count
        students[_studentId].scoredTimes ++;

        // update student score sum
        students[_studentId].scoredSum += _scoredVal;

        // trigger selected event
        emit selectedEvent(_studentId, _scoredVal);
    }

}
