docker inditás
docker compose up -d --build                                                       --- futtatni terminalban (gyökér könyvtár)
docker compose down                                                                --- docker leállitás
docker exec -it expensetracker_backend npx prisma studio --browser none --port 5555       --- prisma studio
docker-compose logs -f backend vagy frotned                                        --- logokat iratja ki
docker-compose restart backend vagy frontend                                       --- ujrainditja az adott kontainert
docker exec expensetracker_backend npm run prisma:seed                                    --- seed

Ez hozza létre a táblákat (User, Account stb.) az üres adatbázisban a konténeren belül:
docker exec -it expensetracker_backend npx prisma db push

npm i (node modules miatt)