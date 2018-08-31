var app = angular.module("appFootball", ['ngRoute']);

app.run(function ($http, $rootScope, $location) {
    $http.defaults.headers.common['X-Auth-Token'] = '7b35712f29da4dc58a538320e57c12cc';
    //var firebaseAuthObject = AuthService.();
    var config = {
        apiKey: "AIzaSyAp0JavN1NGZONHRsKk4fcBAU_Jw_HAras",
        authDomain: "futebol-56191.firebaseapp.com",
        databaseURL: "https://futebol-56191.firebaseio.com",
        projectId: "futebol-56191",
        storageBucket: "futebol-56191.appspot.com",
        messagingSenderId: "975279569273"
    };
    firebase.initializeApp(config);
    firebase.auth().useDeviceLanguage();
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        var auth = firebase.auth();
        if (auth.currentUser == null) {
            $location.path("/login");
        }
    });
    
});


app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: "pages/times.html",
            controller: "TimesController"
        })
        .when('/MeusTimes', {
            templateUrl: "pages/meustimes.html",
            controller: "MeusTimesController"
        })
        .when('/jogadores/:id', {
            templateUrl: "pages/jogadores.html",
            controller: "JogadoresController"
        })
        .when('/cadastro', {
            templateUrl: "pages/cadastro.html",
            controller: "CadastroController"
        })
        .when('/login', {
            templateUrl: 'pages/login.html',
            controller: "LoginController"
        })
        .otherwise({ redirectTo: '/' });
});

app.controller("LoginController", function ($scope, $http, $location, $routeParams) {
    var auth = firebase.auth();
    $scope.entrar = function(){
        var usuario = $scope.usuario
        auth.signInWithEmailAndPassword(usuario.email, usuario.senha)
            .then(function () {
                $location.path('/times')
            })
            .catch(function (error) {
                alert(error);
            });
    }

    $scope.cadastrar = function () {
        var usuario = $scope.usuario
        auth.createUserWithEmailAndPassword(usuario.email, usuario.senha)
            .then(function () {
                $location.path('/times')
            })
            .catch(function (error) {
                alert(error);
            });
    }

    $scope.entrarGoogle = function () {
        var provider = new firebase.auth.GoogleAuthProvider(); 

        auth.signInWithPopup(provider).then(function (result) {
            var token = result.credential.accessToken;
            var user = result.user;
            $location.path('/times')
        }).catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            var email = error.email;
            var credential = error.credential;
        });
    }
});

app.controller("MeusTimesController", function ($scope, $http, $routeParams) {
    var strTimes = window.localStorage.getItem("times")

    if (strTimes == null) {
        $scope.times = []
    } else {
        $scope.times = JSON.parse(strTimes);
    }
});

app.controller("TimesController", function ($scope, $http, $routeParams) {
    $http.get('https://api.football-data.org/v2/teams?areas=2077').
        then(function (response) {
            $scope.times = response.data.teams;
        });
});

app.controller("CadastroController", function ($scope, $http, $routeParams, $location) {
    $scope.jogadores = [];
    $scope.time = {};
    $scope.incluirJogador = function (jogador) {
        var jog = {}
        jog.posicao = jogador.posicao;
        jog.nome = jogador.nome;
        jog.dataNascimento = jogador.dataNascimento;
        $scope.jogadores.push(jog);
        $scope.jogador = {};
    }

    $scope.salvarTime = function () {
        var strTimes = window.localStorage.getItem("times")
        
        if (strTimes == null) {
            $scope.times = []
        } else {
            $scope.times = JSON.parse(strTimes);
        }
        $scope.time.jogadores = $scope.jogadores;
        $scope.times.push($scope.time);
        window.localStorage.setItem("times", JSON.stringify($scope.times));
        alert('Cadastro realizado com sucesso!');
        $location.path("/MeusTimes");
    }
});


app.controller("JogadoresController", function ($scope, $http, $routeParams) {
    $scope.message = "JogadoresController";
    $http.get('https://api.football-data.org/v2/teams/' + $routeParams.id ).
        then(function (response) {
            $scope.time = response.data;
        });

    $http.get('https://api.football-data.org/v1/teams/' + $routeParams.id).
        then(function (response) {
            $scope.logoTime = response.data.crestUrl;
        });
    $scope.parametros = $routeParams
});
