<?php
	class db{
		private $mysql;

		function __construct(){
			$this->mysql = new mysqli(DB_SERVER, DB_USER, DB_PASS, DB_DB);
			$this->mysql->set_charset('utf8'); 

			if ($this->mysql->connect_error){
				die('Connect Error (' . $this->mysql->connect_errno . ') ' . $this->mysql->connect_error);
			}
		}

		public function query($query){
			return $this->mysql->query($query);
		}
	}
?>
