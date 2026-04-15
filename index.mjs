import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool
const conn = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    waitForConnections: true
});

//routes
app.get('/', async (req, res) => {
    //Get authors
    let sql = `SELECT authorId, firstName, lastName
                FROM q_authors
                ORDER BY lastName`;
    const [rows] = await conn.query(sql);

    //Get categories
    sql = `SELECT DISTINCT category
            FROM q_quotes
            ORDER BY category`;
    const [categories] = await conn.query(sql);
    res.render('index', {"authors": rows, "categories": categories});
});

app.get("/authors", async function(req, res){
    let sql = `SELECT *,
            DATE_FORMAT(dob, '%Y-%m-%d') dobISO,
            DATE_FORMAT(dod, '%Y-%m-%d') dodISO
            FROM q_authors
            ORDER BY lastName`;
    const [rows] = await conn.query(sql);
    res.render("authorList", {"authors":rows});
});

app.get("/author/new", (req, res) => {
    res.render("newAuthor");
});


app.post("/author/new", async function(req, res){
    let fName = req.body.fName;
    let lName = req.body.lName;
    let birthDate = req.body.birthDate;
    let deathDate = req.body.deathDate;
    let sex = req.body.sex;
    let profession = req.body.prof;
    let country = req.body.country;
    let portrait = req.body.portrait;
    let biography = req.body.biography;

    let sql = `INSERT INTO q_authors
             (firstName, lastName, dob, dod, 
             sex, profession, country, portrait, 
             biography)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    let params = [fName, lName, birthDate, deathDate, 
                sex, profession, country, portrait, 
                biography];

    const [rows] = await conn.query(sql, params);
    res.render("newAuthor", 
             {"message": "Author added!"});
});

app.get("/author/edit", async function(req, res){
    let authorId = req.query.authorId;
    
    let sql = `SELECT *, 
        DATE_FORMAT(dob, '%Y-%m-%d') dobISO,
        DATE_FORMAT(dod, '%Y-%m-%d') dodISO
        FROM q_authors
        WHERE authorId =  ${authorId}`;
    const [rows] = await conn.query(sql);
    res.render("editAuthor", {"authorInfo":rows});
});

app.post("/author/edit", async function(req, res){
    let sql = `UPDATE q_authors
            SET firstName = ?,
                lastName = ?,
                dob = ?,
                dod = ?,
                sex = ?, 
                profession = ?,
                country = ?,
                portrait = ?, 
                biography = ?
            WHERE authorId =  ?`;
    let params = [req.body.fName,  
              req.body.lName, req.body.dob, 
              req.body.dod, req.body.sex, req.body.prof, 
              req.body.country, req.body.portrait, 
              req.body.biography, req.body.authorId];         
    const [rows] = await conn.query(sql,params);
    res.redirect("/authors");
});

app.get("/author/delete", async function(req, res){
    let authorId = req.query.authorId;

    let sql = `DELETE
                FROM q_authors
                WHERE authorId = ?`;

    const [rows] = await conn.query(sql, [authorId]);

    res.redirect("/authors");
});

//-- Quotes --
app.get("/quotes", async function(req, res){
    let sql = `SELECT a.authorId, a.firstName, a.lastName, q.quoteId, q.quote, q.likes, q.category
                FROM q_quotes q
                JOIN q_authors a ON q.authorId = a.authorId
                ORDER BY q.category`;
    const [rows] = await conn.query(sql);
    res.render("quoteList", {"quotes":rows});
});

app.get("/quote/new", async function (req, res){
    let sql = `SELECT DISTINCT category
                FROM q_quotes`;

    const [cats] = await conn.query(sql);  
    
    sql = `SELECT authorId, firstName, lastName
                FROM q_authors`;

    const [authors] = await conn.query(sql);            

    res.render("newQuote", {"cats": cats , "authors" : authors});
});

app.post("/quote/new", async function(req, res){
    let quote = req.body.quote;
    let category = req.body.category;
    let likes = req.body.likes;
    let authorId = req.body.author;
    let sql = `INSERT INTO q_quotes
             (quote, authorId, category, likes)
              VALUES (?, ?, ?, ?)`;
    let params = [quote, authorId, category, likes];
    const [rows] = await conn.query(sql, params);

    sql = `SELECT DISTINCT category
                FROM q_quotes`;

    const [cats] = await conn.query(sql);  
    
    sql = `SELECT authorId, firstName, lastName
                FROM q_authors`;

    const [authors] = await conn.query(sql);            
    res.render("newQuote", 
             {"message": "Quote added!", "cats": cats , "authors" : authors});
});

app.get("/quote/edit", async function(req, res){
    let quoteId = req.query.quoteId;


    let sql = `SELECT *
        FROM q_quotes
        WHERE quoteId =  ?`;
    const [rows] = await conn.query(sql, [quoteId]);

    sql = `SELECT DISTINCT category
                FROM q_quotes`;

    const [cats] = await conn.query(sql);  
    
    sql = `SELECT authorId, firstName, lastName
                FROM q_authors`;

    const [authors] = await conn.query(sql);  
    res.render("editQuote", {"quoteInfo":rows, "cats": cats , "authors" : authors});
});

app.post("/quote/edit", async function(req, res){
    let sql = `UPDATE q_quotes
            SET quote = ?,
                authorId = ?,
                category = ?,
                likes = ?
            WHERE quoteId =  ?`;


    let params = [req.body.quote,  
              req.body.author, req.body.category, 
              req.body.likes,req.body.quoteId];         
    const [rows] = await conn.query(sql, params);
    res.redirect("/quotes");
});

app.get("/quote/delete", async function(req, res){
    let quoteId = req.query.quoteId;

    let sql = `DELETE
                FROM q_quotes
                WHERE quoteId = ?`;

    const [rows] = await conn.query(sql, [quoteId]);
    res.redirect("/quotes");
});

app.get('/api/author/:id', async (req, res) => {
    let authorId = req.params.id;
    let sql = `SELECT * 
                FROM q_authors
                WHERE authorId = ?`;
    const [rows] = await conn.query(sql, [authorId]);
    res.send(rows);
});


app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error");
    }
});//dbTest

app.listen(3000, ()=>{
    console.log("Express server running")
})