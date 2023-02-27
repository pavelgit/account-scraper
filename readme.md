# Account scraper

This project offers the following functionality:
- Browser automation for downloading transaction report from commerzbank.de and consorsbank.de
- Transaction categorization system
- Browser automation to upload CSV files to hahabu.de
- Extensible class system to add your banking accounts
- CLI interface

## How to start using it?

Add your banking accounts as runners into the combinedRunner.availableRunners in the main.js file, for example:
```javascript
const combinedRunner = require('./runners/combined.runner.js');
combinedRunner.availableRunners.push(
	new CommerzbankRunner(
	    'commerzbank_runner', 
	    'commerzbank hahabu account', 
	    {
			bankAccount: '12345678',
			bankPin: '99999',
			hahabuUsername: 'your-hahabu.de-username',
			hahabuPassword: 'your-hahabu.de-password',
		}
	)
);
```

Then just start the project:
```
yarn start;
```

In the CLI use the following commands:
- scrape [< name of the runner > | all ], to scrape the transactions report from the runner, for example ```scrape commerzbank_runner``` or ```scrape all```. You will find the scraped CSV file in the ```workload/scraped``` folder.
- categorize [< name of the runner > | all ], to categorize the transactions in the scraped transactions report, for example ```categorize commerzbank_runner``` or ```categorize all```. You will find the categorized CSV file in the ```workload/categorized``` folder.
- upload [< name of the runner > | all ], to upload the categorized transaction report to hahabu.de, for example ```upload commerzbank_runner``` or ```upload all```
- clean [< name of the runner > | all ], to remove the scraped and categorized files of the runner ```clean commerzbank_runner``` or ```clean all```
- exit, to exit the CLI

## How to use categorization system

Just add categories to the config/categories.json, for example:
```json
[
	{  
	  "usageRegex": "kaufland|edeka",  
	  "category": "Food"
	}
]
```
