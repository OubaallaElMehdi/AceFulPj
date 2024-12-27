# Détection de localisation anormale avec des algorithmes de machine learning
  # Table de matière:
    I. Introduction
      1.	Contexte et objectifs
       1.1 Objectifs principaux
      2.  Vue d'ensemble du projet
      3.  Cas d'utilisation
    II. Architecture Technique
      1.	Structure du projet
      2.	Technologies utilisées
      3.	Conteneurisation et déploiement 
    III. Fonctionnalités
      1. Génération de code
      2. Interface utilisateur
    IV.	Guide d'installation
      1.	Prérequis
      2.  Installation et configuration
      3.  Déploiement

      
  # I.	Introduction
   # 1.	Contexte et objectifs
   Le projet de détection de localisation anormale est une solution innovante utilisant l'intelligence artificielle pour analyser en temps réel les données de géolocalisation 
   des flottes de véhicules. Le système apprend les schémas normaux de déplacement et détecte automatiquement les comportements inhabituels pouvant indiquer des risques 
   ou des inefficacités opérationnelles.
   # 1.1 Objectifs principaux:
     - Détection des anomalies basée sur des algorithmes ML
     - Génération d'alertes basée sur les anomalies détectées
     - Gestion des informations des véhicules
     - Gestion des comptes utilisateurs
   # 2.  Vue d'ensemble du projet
  Le projet utilise une architecture microservices pour garantir la modularité et la scalabilité. Chaque microservice est responsable d’une fonction spécifique, 
  allant de la gestion des véhicules à la détection des anomalies et aux notifications d’alertes. Le système est déployé avec Docker Compose, 
  facilitant ainsi l’orchestration des services.
   # 3. Cas d'utilisation
   Imaginons une entreprise de livraison qui souhaite surveiller ses camions en temps réel pour détecter des anomalies qui pourraient indiquer des problèmes, 
   comme un détour imprévu ou un arrêt prolongé. Ce système pourrait signaler ces anomalies, permettant à l'entreprise de réagir rapidement, 
   soit en contactant le conducteur, soit en ajustant l’itinéraire pour minimiser les impacts.   
  # II.	Architecture Technique
  # 1. Structure du projet
   Le projet est construit selon une architecture microservices, chaque microservice gère une fonctionnalité spécifique, voici les principaux composants :
   
        * Ace-Gateway (Spring boot)
         Service de passerelle API
         
        * Ace-Eureka (Spring boot)
         Service de découverte et registre des services
         
        * AnomalyDetectionService (Python)
         Service principal de détection des anomalies à l’aide de modèles de machine learning
         
        * AlertService (Spring boot)
         Service de Gestion et envoi des alertes
         
        * VehicleService (Spring boot)
         Service de Gestion des données des véhicules
         
        * UserService (Spring boot)
         Service de Gestion des utilisateurs
         
        * next-ace-front (Next.js)
        Service pour l'Application web principale 
        
   
   AceFulPj/
   
      ├── .idea                     
      
      ├── Ace-Eureka/               
            
      ├── Ace-Gateway/              
      
      ├── AlertService/             
      
      ├── AnomalyDetectionService/ 
      
      ├── UserService/              

      ├── VehicleService/  
      
      ├── next-ace-front/              
      
      ├── docker-compose.yml/          

      └── vehicle_service.sql/  

   # 2.	Technologies utilisées
   
        Backend : Spring Boot
        Frontend : Next.js
        Bases de données : MySQL
        Message Broker : Apache Kafka
        Conteneurisation : Docker, Docker Compose
        Registre de services : Eureka
        API Gateway : Spring Cloud Gateway
        Machine Learning : Implémentation dans Anomaly Detection Service
        CI/CD : Jenkins
        Analyse de code : SonarCloud
        
   # 3.	Conteneurisation et déploiement  
   
   Chaque microservice est encapsulé dans un conteneur Docker. L’orchestration des conteneurs est gérée par Docker Compose. Voici les étapes principales :
   
      * Définition des fichiers Dockerfile pour chaque service.
      * Configuration de docker-compose.yml pour démarrer tous les services simultanément.
      * Mise en place des pipelines CI/CD avec Jenkins pour automatiser les tests, la construction des images Docker, et le déploiement.
      * Intégration de SonarCloud pour assurer la qualité du code.
      
   # 3.1 Configuration Docker

    version: '3.8'

    services:
      # Eureka Service Registry
      eureka-server:
        build:
          context: ./Ace-Eureka
        ports:
          - "8761:8761"
        container_name: ace-eureka
        networks:
          - ace-network
        environment:
          - EUREKA_CLIENT_REGISTER_WITH_EUREKA=false
          - EUREKA_CLIENT_FETCH_REGISTRY=false
        restart: always

     zookeeper:
      image: bitnami/zookeeper:latest
        container_name: zookeeper
        ports:
          - "2181:2181"
        environment:
          - ALLOW_ANONYMOUS_LOGIN=yes
        networks:
          - ace-network

     kafka:
      image: confluentinc/cp-kafka:latest
        container_name: kafka
        ports:
          - "9092:9092" # Internal and external communication
          - "29092:29092" # Host access
        environment:
          KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092,PLAINTEXT_HOST://0.0.0.0:29092
          KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092,PLAINTEXT_HOST://localhost:29092
          KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
          KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
          KAFKA_BROKER_ID: 1
          KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
          KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
        depends_on:
          - zookeeper
        networks:
          - ace-network
        restart: always

    # Gateway Service
    gateway-service:
       build:
         context: ./Ace-Gateway
         ports:
           - "8080:8080"
         container_name: ace-gateway
         networks:
           - ace-network
         depends_on:
           - eureka-server
         environment:
           - EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://ace-eureka:8761/eureka
           - SPRING_PROFILES_ACTIVE=docker

    #   Anomaly Detection Service
    anomaly-detection-service:
        build:
          context: ./AnomalyDetectionService
          ports:
             - "5000:5000"
          container_name: anomaly-detection-service
          networks:
             - ace-network
          depends_on:
             - gateway-service
             - kafka
             - vehicle-service
             - ace-frontend
          environment:
             - KAFKA_BROKER=kafka:9092
             - VEHICLE_SERVICE_URL=http://vehicle-service:8081

     # Vehicle Service
     vehicle-service:
        build:
          context: ./VehicleService
          ports:
             - "8081:8081"
          container_name: vehicle-service
          networks:
             - ace-network
          depends_on:
             - eureka-server
             - vehicle-db
             - gateway-service
             - kafka
          environment:
             - EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://ace-eureka:8761/eureka
             - SPRING_PROFILES_ACTIVE=docker
             - SPRING_DATASOURCE_URL=jdbc:mysql://vehicle-db:3306/vehicle_service
             - SPRING_DATASOURCE_USERNAME=root
             - SPRING_DATASOURCE_PASSWORD=root
             - SPRING_KAFKA_BOOTSTRAP-SERVERS=kafka:9092
           restart: always

     # User Service
     user-service:
        build:
          context: ./UserService
          ports:
             - "8082:8082"
          container_name: user-service
          networks:
             - ace-network
          depends_on:
             - eureka-server
             - user-db
             - gateway-service
             - kafka
          environment:
             - EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://ace-eureka:8761/eureka
             - SPRING_PROFILES_ACTIVE=docker
             - SPRING_DATASOURCE_URL=jdbc:mysql://user-db:3306/user_service
             - SPRING_DATASOURCE_USERNAME=root
             - SPRING_DATASOURCE_PASSWORD=root
          restart: always

    # Alert Service
    alert-service:
        build:
           context: ./AlertService
           ports:
              - "8083:8083"
           container_name: alert-service
           networks:
              - ace-network
           depends_on:
              - eureka-server
              - alert-db
              - gateway-service
              - kafka
           environment:
              - EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://ace-eureka:8761/eureka
              - SPRING_PROFILES_ACTIVE=docker
              - SPRING_DATASOURCE_URL=jdbc:mysql://alert-db:3306/alert_service
              - SPRING_DATASOURCE_USERNAME=root
              - SPRING_DATASOURCE_PASSWORD=root
           restart: always
     # MySQL for Vehicle Service
     vehicle-db:
          image: mysql:8
          container_name: vehicle-db
          networks:
             - ace-network
          environment:
             - MYSQL_ROOT_PASSWORD=root
             - MYSQL_DATABASE=vehicle_service
           ports:
             - "3307:3306"
           volumes:
             - ./vehicle_service.sql:/docker-entrypoint-initdb.d/vehicle_service.sql

      # MySQL for User Service
        user-db:
          image: mysql:8
          container_name: user-db
          networks:
              - ace-network
          environment:
              - MYSQL_ROOT_PASSWORD=root
              - MYSQL_DATABASE=user_service
          ports:
              - "3308:3306"

       # MySQL for Alert Service
         alert-db:
             image: mysql:8
             container_name: alert-db
             networks:
                - ace-network
             environment:
                - MYSQL_ROOT_PASSWORD=root
                - MYSQL_DATABASE=alert_service
             ports:
                - "3309:3306"

       #  Angular Frontend
       ace-frontend:
             build:
               context: ./next-ace-front
               ports:
                   - "3000:3000"
               container_name: ace-frontend
               networks:
                   - ace-network
               depends_on:
                   - gateway-service
               environment:
                   - NG_PROXY=http://gateway-service:8080

    networks:
       ace-network:
          driver: bridge

  # III.  Fonctionnalités
   # 1. Génération de code
     * Les services backend sont générés avec des outils comme Spring Boot Initializer.
     * Intégration des modèles de machine learning pour détecter les anomalies.  
   # 2. Interface utilisateur
     L’interface utilisateur permet :
     * La visualisation des trajectoires des véhicules en temps réel.
     * La gestion des utilisateurs et des rôles.
     * L’affichage des alertes et des anomalies détectées.
  #  IV.	Guide d'installation
   # 1.	Prérequis
      1.2 Environnement de Développement

       * Python 3.10
       * Java JDK 17 ou supérieur et Maven pour les services backend
       * Node.js 16.x ou supérieur
       * Docker et Docker Compose installés
       * Git
       
   # 2.  Installation et configuration
   
       * Clonez le projet depuis le dépôt GitHub :
           git clone https://github.com/OubaallaElMehdi/AceFulPj.git

       * Naviguez vers le répertoire du projet :
           cd AceFulPj
       * Construisez et lancez les conteneurs Docker :
           docker-compose up --build
       * Configurez Jenkins pour exécuter les pipelines de construction et de déploiement.
   # 3.  Déploiement
       * Utilisez Docker Compose pour déployer en local ou sur un serveur distant.
       * Le projet est hébergé sur un serveur distant et accessible via le domaine :
            http://147.79.115.242:3000/


     
