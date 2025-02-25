/*------------------------------------------------*/
CREATE TABLE USERS (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    NAME VARCHAR(100) NOT NULL,
    EMAIL VARCHAR(100) UNIQUE NOT NULL,
    PASSWORD VARCHAR(255) NOT NULL
);

SELECT * FROM USERS;

CREATE TABLE ORDERS (
    ORDER_NUM INT AUTO_INCREMENT PRIMARY KEY,
    EMAIL VARCHAR(100) NOT NULL,
    ADDRESS TEXT NOT NULL,
    ITEMS JSON NOT NULL,
    FOREIGN KEY (email) REFERENCES Users(email)
) AUTO_INCREMENT=10000;

select * from orders;