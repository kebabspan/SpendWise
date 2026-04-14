-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: spendwise
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Account`
--

DROP TABLE IF EXISTS `Account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Account` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `balance` decimal(12,2) NOT NULL DEFAULT '0.00',
  `color` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Account_userId_fkey` (`userId`),
  CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Account`
--

LOCK TABLES `Account` WRITE;
/*!40000 ALTER TABLE `Account` DISABLE KEYS */;
INSERT INTO `Account` VALUES ('cmmmpcowd00004dqoqjmkukkd','OTP Bankszámla',201223.00,'#1565c0',NULL,'cmmmp86zf00014do2nrdtives','2026-03-12 00:00:59.910','2026-03-24 17:29:48.380'),('cmmnosk9e000k4ssabe0qcauw','Otp számla',55161.00,'#4527a0',NULL,'cmmnor873000j4ssawmqyag96','2026-03-12 16:33:06.960','2026-03-12 16:33:06.960'),('cmmuieuty00004dprtz804msu','Revolut',261000.00,'#2e7d32',NULL,'cmmmp86zf00014do2nrdtives','2026-03-17 11:08:53.006','2026-03-17 11:08:53.006'),('cmmujcn2100034dpr51ntp7kv','OTP Bankszámla',441546.00,'#1565c0',NULL,'cmmujao4900024dpr8usf30h4','2026-03-17 11:35:09.238','2026-03-17 12:26:38.081');
/*!40000 ALTER TABLE `Account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AuthToken`
--

DROP TABLE IF EXISTS `AuthToken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AuthToken` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('RESET_PASSWORD','VERIFY_EMAIL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `AuthToken_token_key` (`token`),
  KEY `AuthToken_userId_fkey` (`userId`),
  CONSTRAINT `AuthToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AuthToken`
--

LOCK TABLES `AuthToken` WRITE;
/*!40000 ALTER TABLE `AuthToken` DISABLE KEYS */;
/*!40000 ALTER TABLE `AuthToken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Budget`
--

DROP TABLE IF EXISTS `Budget`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Budget` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `limitAmount` decimal(12,2) NOT NULL,
  `month` int NOT NULL,
  `year` int NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoryId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Budget_userId_categoryId_month_year_key` (`userId`,`categoryId`,`month`,`year`),
  KEY `Budget_categoryId_fkey` (`categoryId`),
  CONSTRAINT `Budget_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Budget_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Budget`
--

LOCK TABLES `Budget` WRITE;
/*!40000 ALTER TABLE `Budget` DISABLE KEYS */;
INSERT INTO `Budget` VALUES ('cmmno5a1k000b4ssamevdrpoo',30000.00,3,2026,'cmmmp86zf00014do2nrdtives','cmmno07yq00034ssa7inzz2iz'),('cmmno74mx000c4ssacu05k0tn',50000.00,3,2026,'cmmmp86zf00014do2nrdtives','cmmnnz75o00014ssarr58i7vw'),('cmmnojxbb000h4ssa8qdaoroj',60000.00,3,2026,'cmmmp86zf00014do2nrdtives','cmmnoid08000f4ssagmsmxaxr'),('cmmujjp2m00064dpr6dv7r05r',30000.00,3,2026,'cmmujao4900024dpr8usf30h4','cmmujh1jb00054dpr3p3yn86b');
/*!40000 ALTER TABLE `Budget` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Category`
--

DROP TABLE IF EXISTS `Category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Category` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('EXPENSE','INCOME','TRANSFER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Category_userId_name_type_key` (`userId`,`name`,`type`),
  CONSTRAINT `Category_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Category`
--

LOCK TABLES `Category` WRITE;
/*!40000 ALTER TABLE `Category` DISABLE KEYS */;
INSERT INTO `Category` VALUES ('cmmnnywq500004ssagg3e7q6v','Élelmiszer','EXPENSE',NULL,'#7b1fa2','cmmmp86zf00014do2nrdtives'),('cmmnnz75o00014ssarr58i7vw','Utazás','EXPENSE',NULL,'#1565c0','cmmmp86zf00014do2nrdtives'),('cmmnnztmh00024ssa16k29fek','Előfizetések','EXPENSE',NULL,'#ffee58','cmmmp86zf00014do2nrdtives'),('cmmno07yq00034ssa7inzz2iz','Szórakozás','EXPENSE',NULL,'#00bcd4','cmmmp86zf00014do2nrdtives'),('cmmnoid08000f4ssagmsmxaxr','Fenntartási költségek','EXPENSE',NULL,'#2e7d32','cmmmp86zf00014do2nrdtives'),('cmmujh1jb00054dpr3p3yn86b','Élelmiszer','EXPENSE',NULL,'#43a047','cmmujao4900024dpr8usf30h4');
/*!40000 ALTER TABLE `Category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Goal`
--

DROP TABLE IF EXISTS `Goal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Goal` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `targetAmount` decimal(12,2) NOT NULL,
  `savedAmount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `deadline` datetime(3) DEFAULT NULL,
  `color` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Goal_userId_fkey` (`userId`),
  CONSTRAINT `Goal_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Goal`
--

LOCK TABLES `Goal` WRITE;
/*!40000 ALTER TABLE `Goal` DISABLE KEYS */;
INSERT INTO `Goal` VALUES ('cmmnol4pk000i4ssaibdd6e70','Nyári vakáció',500000.00,150000.00,'2026-06-30 00:00:00.000','#ffee58',NULL,'cmmmp86zf00014do2nrdtives','2026-03-12 16:27:20.214','2026-03-12 16:27:29.217'),('cmmujmfr800074dprxet56uiv','Nyári vakáció',200000.00,50000.00,'2026-07-31 00:00:00.000','#5b8cff',NULL,'cmmujao4900024dpr8usf30h4','2026-03-17 11:42:46.337','2026-03-17 11:44:33.468');
/*!40000 ALTER TABLE `Goal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RecurringTransaction`
--

DROP TABLE IF EXISTS `RecurringTransaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `RecurringTransaction` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `type` enum('EXPENSE','INCOME','TRANSFER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `frequency` enum('DAILY','WEEKLY','MONTHLY','YEARLY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nextDate` datetime(3) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoryId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `accountId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `RecurringTransaction_userId_fkey` (`userId`),
  KEY `RecurringTransaction_categoryId_fkey` (`categoryId`),
  KEY `RecurringTransaction_accountId_fkey` (`accountId`),
  CONSTRAINT `RecurringTransaction_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `RecurringTransaction_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `RecurringTransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RecurringTransaction`
--

LOCK TABLES `RecurringTransaction` WRITE;
/*!40000 ALTER TABLE `RecurringTransaction` DISABLE KEYS */;
INSERT INTO `RecurringTransaction` VALUES ('cmmno288t00064ssa0l5q0jrw','Netflix',3990.00,'EXPENSE','MONTHLY','2026-03-01 00:00:00.000',1,'cmmmp86zf00014do2nrdtives','cmmnnztmh00024ssa16k29fek','cmmmpcowd00004dqoqjmkukkd','2026-03-12 16:12:38.331','2026-03-12 16:12:38.331'),('cmmno2nbu00074ssa4k19zp0k','Spotify',1950.00,'EXPENSE','MONTHLY','2026-03-04 00:00:00.000',1,'cmmmp86zf00014do2nrdtives','cmmnnztmh00024ssa16k29fek','cmmmpcowd00004dqoqjmkukkd','2026-03-12 16:12:57.880','2026-03-12 16:28:08.457'),('cmmno31rf00084ssa2c379j20','Fizetésem',560000.00,'INCOME','MONTHLY','2026-02-10 00:00:00.000',1,'cmmmp86zf00014do2nrdtives',NULL,'cmmmpcowd00004dqoqjmkukkd','2026-03-12 16:13:16.585','2026-03-24 17:45:29.098'),('cmmujrser00084dpryofjsncs','Netflix előfizetés',4990.00,'EXPENSE','MONTHLY','2026-03-17 00:00:00.000',1,'cmmujao4900024dpr8usf30h4',NULL,'cmmujcn2100034dpr51ntp7kv','2026-03-17 11:46:56.014','2026-03-17 11:46:56.014'),('cmn4wouap000c4dprk2okfist','Disney',3000.00,'EXPENSE','MONTHLY','2026-04-24 00:00:00.000',1,'cmmmp86zf00014do2nrdtives','cmmnnztmh00024ssa16k29fek','cmmmpcowd00004dqoqjmkukkd','2026-03-24 17:46:15.262','2026-03-24 18:00:54.893');
/*!40000 ALTER TABLE `RecurringTransaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Tag`
--

DROP TABLE IF EXISTS `Tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Tag` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Tag_userId_name_key` (`userId`,`name`),
  CONSTRAINT `Tag_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Tag`
--

LOCK TABLES `Tag` WRITE;
/*!40000 ALTER TABLE `Tag` DISABLE KEYS */;
/*!40000 ALTER TABLE `Tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Transaction`
--

DROP TABLE IF EXISTS `Transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Transaction` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `place` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `type` enum('EXPENSE','INCOME','TRANSFER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoryId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fromAccountId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `toAccountId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Transaction_userId_date_idx` (`userId`,`date`),
  KEY `Transaction_categoryId_fkey` (`categoryId`),
  KEY `Transaction_fromAccountId_fkey` (`fromAccountId`),
  KEY `Transaction_toAccountId_fkey` (`toAccountId`),
  CONSTRAINT `Transaction_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Transaction_fromAccountId_fkey` FOREIGN KEY (`fromAccountId`) REFERENCES `Account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Transaction_toAccountId_fkey` FOREIGN KEY (`toAccountId`) REFERENCES `Account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Transaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Transaction`
--

LOCK TABLES `Transaction` WRITE;
/*!40000 ALTER TABLE `Transaction` DISABLE KEYS */;
INSERT INTO `Transaction` VALUES ('cmmmpeb8c00014dqo25lopgtc',5000.00,'Heti bevásárlás','Tesco','2026-03-12 00:00:00.000','EXPENSE','cmmmp86zf00014do2nrdtives',NULL,'cmmmpcowd00004dqoqjmkukkd',NULL,'2026-03-12 00:02:15.516'),('cmmmq8amn00034dqons4hhl8v',6548.00,NULL,NULL,'2026-03-12 00:00:00.000','EXPENSE','cmmmp86zf00014do2nrdtives',NULL,'cmmmpcowd00004dqoqjmkukkd',NULL,'2026-03-12 00:25:34.415'),('cmmno0tog00044ssaylhityrf',15000.00,NULL,'Blue Box','2026-03-12 00:00:00.000','EXPENSE','cmmmp86zf00014do2nrdtives','cmmno07yq00034ssa7inzz2iz','cmmmpcowd00004dqoqjmkukkd',NULL,'2026-03-12 16:11:32.800'),('cmmno1cra00054ssamfhu4e7r',41500.00,'Tankolás','MOL','2026-03-06 00:00:00.000','EXPENSE','cmmmp86zf00014do2nrdtives','cmmnnz75o00014ssarr58i7vw','cmmmpcowd00004dqoqjmkukkd',NULL,'2026-03-12 16:11:57.526'),('cmmno4muk00094ssaqzaknmy2',57500.00,'Maszek',NULL,'2026-03-12 00:00:00.000','INCOME','cmmmp86zf00014do2nrdtives',NULL,'cmmmpcowd00004dqoqjmkukkd',NULL,'2026-03-12 16:14:30.572'),('cmmno7qzu000d4ssaydhfa1qb',9000.00,'','Tesco','2026-03-09 00:00:00.000','EXPENSE','cmmmp86zf00014do2nrdtives','cmmnnywq500004ssagg3e7q6v','cmmmpcowd00004dqoqjmkukkd',NULL,'2026-03-12 16:16:55.913'),('cmmnog7vn000e4ssahpl5owih',150000.00,NULL,NULL,'2026-03-21 00:00:00.000','INCOME','cmmmp86zf00014do2nrdtives',NULL,'cmmmpcowd00004dqoqjmkukkd',NULL,'2026-03-12 16:23:31.043'),('cmmnoj550000g4ssah84igm4u',24861.00,'Autó biztosítás',NULL,'2026-03-10 00:00:00.000','EXPENSE','cmmmp86zf00014do2nrdtives','cmmnoid08000f4ssagmsmxaxr','cmmmpcowd00004dqoqjmkukkd',NULL,'2026-03-12 16:25:47.460'),('cmmujevdi00044dprt4tc8vdm',5000.00,'Heti bevásárlás','Tesco','2026-03-17 00:00:00.000','EXPENSE','cmmujao4900024dpr8usf30h4',NULL,'cmmujcn2100034dpr51ntp7kv',NULL,'2026-03-17 11:36:53.334'),('cmmuk069m00094dpr2un0uh0i',300000.00,'Havi fizetés',NULL,'2026-03-17 00:00:00.000','INCOME','cmmujao4900024dpr8usf30h4',NULL,'cmmujcn2100034dpr51ntp7kv',NULL,'2026-03-17 11:53:27.226'),('cmmul6uev000a4dpr2o1dobwt',3454.00,NULL,'Tesco','2026-03-17 00:00:00.000','EXPENSE','cmmujao4900024dpr8usf30h4','cmmujh1jb00054dpr3p3yn86b','cmmujcn2100034dpr51ntp7kv',NULL,'2026-03-17 12:26:38.071'),('cmn4w3os2000b4dprkkg4tmdg',54368.00,NULL,NULL,'2026-03-18 00:00:00.000','EXPENSE','cmmmp86zf00014do2nrdtives','cmmnnz75o00014ssarr58i7vw','cmmmpcowd00004dqoqjmkukkd',NULL,'2026-03-24 17:29:48.338');
/*!40000 ALTER TABLE `Transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TransactionTag`
--

DROP TABLE IF EXISTS `TransactionTag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TransactionTag` (
  `transactionId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tagId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`transactionId`,`tagId`),
  KEY `TransactionTag_tagId_fkey` (`tagId`),
  CONSTRAINT `TransactionTag_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `TransactionTag_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `Transaction` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TransactionTag`
--

LOCK TABLES `TransactionTag` WRITE;
/*!40000 ALTER TABLE `TransactionTag` DISABLE KEYS */;
/*!40000 ALTER TABLE `TransactionTag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'HUF',
  `imageUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES ('cmmmo3tmw00004do2apa2pe7o','test@test.com','$2b$10$ME1FC90xGzfh0EythrXqJekdpoll6hbOiNKl.u9flHenp4qzitlmm','Test User','HUF',NULL,'2026-03-11 23:26:06.528','2026-03-11 23:26:06.528'),('cmmmp86zf00014do2nrdtives','pelda1@gmail.com','$2b$10$AjHecewxhAApecRFmusmbu9guZPBp2FRv1GMA8TeTvwQ42yXLOFKS','Dávid','HUF',NULL,'2026-03-11 23:57:30.069','2026-03-12 16:31:17.778'),('cmmnor873000j4ssawmqyag96','pongorita@gmail.com','$2b$10$UZiihW/rAyKAoYXhAaE4WunPFj9j40TH5P8ZqI7dJDBAKbYjYY5YS','Nagyné Pongó Rita','HUF',NULL,'2026-03-12 16:32:04.669','2026-03-12 16:32:04.669'),('cmmujao4900024dpr8usf30h4','teszt@spendwise.com','$2b$10$W9t619VIj7AD.0st01cGl.Q.Tu1iGeMpcX/1xJ8EnLodGcmg81Gi6','Teszt Felhasználó','HUF',NULL,'2026-03-17 11:33:37.302','2026-03-17 11:33:37.302');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-24 23:45:24
