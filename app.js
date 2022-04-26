const express = require('express');
const bodyParser = require('body-parser');
const koneksi = require('./config/database');
const app = express();
const PORT = process.env.PORT || 5000;
const multer = require('multer');
const path = require('path');

// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));

// create data / insert data
app.post('/api/movies', (req, res) => {
            // buat variabel penampung data dan query sql
            const data = {...req.body };
            const querySql = 'INSERT INTO movies SET ?';

            // jalankan query
            koneksi.query(querySql, data, (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Gagal insert data!', error: err });
                }

                // jika request berhasil
                res.status(201).json({ success: true, message: 'Berhasil insert data!' });
            });

            //read data /get data
            app.get('/api/movies', (req, res) => {
                const querySql = 'SELECT * FROM movies';
                koneksi.query(querySql, (err, rows, field) => {
                    if (err) {
                        return res.status(500).json({ message: 'Ada kesalahan', error: err });
                    }
                    res.status(200).json({ success: true, data: rows });
                })
            });

            //update data
            app.put('/api/movies/:id', (req, res) => {
                const data = {...req.body };
                const querySearch = 'SELECT * FROM movies WHERE id =?';
                const queryUpdate = 'UPDATE movies SET ? WHERE id = ?';

                koneksi.query(querySearch, req.params.id, (err, rows, field) => {
                    if (err) {
                        return res.status(500).json({ message: 'Ada kesalahan', error: err });
                    }
                    res.status(200).json({ success: true, message: 'Berhasil update data!' });
                });
            } else {
                return res.status(400).json({ message: 'Data tidak ditemukan!', success: false });
            });

            app.delete('/api/movies/:id', (req, res) => {
                const querySearch = 'SELECT * FROM movies WHERE id =?';
                const queryDelete = 'DELETE movies SET ? WHERE id = ?';

                koneksi.query(querySearch, req.params.id, (err, rows, field) => {
                    if (err) {
                        return res.status(500).json({ message: 'Ada kesalahan', error: err })
                    }
                    if (rows.length) {
                        koneksi.query(queryDelete, req.params.id, (err, rows, field) => {
                            if (err) {
                                return res.status(500).json({ message: 'Ada kesalahan', error: err });
                            }
                            res.status(200).json({ success: true, message: 'Berhasil hapus data!' });
                        });
                    } else {
                        return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
                    }
                });
            });

            // set body parser
            app.use(bodyParser.json());
            app.use(bodyParser.urlencoded({ extended: true }));
            // buat server nya
            //use express static folder
            app.use(express.static("./public"))
                //! Use of Multer
            var storage = multer.diskStorage({
                destination: (req, file, callBack) => {
                    callBack(null, './public/images/') // './public/images/' directory name where save the file
                },
                filename: (req, file, callBack) => {
                    callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
                }
            })
            var upload = multer({
                storage: storage
            });
            // create data / insert data
            app.post('/api/movies', upload.single('image'), (req, res) => {

                if (!req.file) {
                    console.log("No file upload");
                } else {
                    console.log(req.file.filename)
                    var imgsrc = 'http://localhost:5000/images/' + req.file.filename
                        // buat variabel penampung data dan query sql
                    const data = {...req.body };
                    const querySql = 'INSERT INTO movies (judul,rating,deskripsi,foto) values (?,?,?,?);';
                    const judul = req.body.judul;
                    const rating = req.body.rating;
                    const deskripsi = req.body.deskripsi;
                    const foto = imgsrc;

                    // jalankan query
                    koneksi.query(querySql, [judul, rating, deskripsi, foto], (err, rows, field) => {
                        // error handling
                        if (err) {
                            return res.status(500).json({ message: 'Gagal insert data!', error: err });
                        }

                        // jika request berhasil
                        res.status(201).json({ success: true, message: 'Berhasil insert data!' });
                    });
                    /* var insertData = "INSERT INTO users_file(file_src)VALUES(?)"
                     db.query(insertData, [imgsrc], (err, result) => {
                         if (err) throw err
                         console.log("file uploaded")
                     })*/
                }

            });