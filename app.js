
var budgetController = (function(){
   
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePercentage =  function(totalIncome){
        if(totalIncome > 0 ){
            this.percentage = Math.round((this.value / totalIncome) * 100);
         }
         else{
             this.percentage = -1;
         }
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){


        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        
        data.totals[type] = sum;
    };

   
    var data = {
        allItems: {
            exp: [],
            inc: []
        },

        totals:{
            exp:0,
            inc:0
        },

        budget: 0,
        percentage: -1

    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            //Create new ID

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //Create new item based on "exp" or "inc" type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            }
            else if (type ==='inc') {
                newItem = new Income(ID, des, val);
            }

            //Push it into our data structure
            data.allItems[type].push(newItem);

            //return the new element
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;
            
            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function() {

           // 1.calculate total income and expenses
           calculateTotal('exp');
           calculateTotal('inc');

           //2. calculate total budget
           data.budget = data.totals.inc - data.totals.exp;

           //3.calculate the percentage of income we spent
           if(data.totals.inc > 0 ){
               data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else{
                data.percentage = -1;
            }

        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calculatePercentage(data.totals.inc);

            });
            
        },

        getPercentages: function(){

            var allPerc = data.allItems.exp.map(function(cur){
                 return cur.getPercentage();
             });

            return allPerc;
        },
        
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing:function(){
            console.log(data);
        }
    };

})();


var UIcontroller = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeList: '.income__list',
        expensesList: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercLabel: '.item__percentage',
        getMonth: '.budget__title--month'

    };

    var formatNumber = function(num, type){
        var int, dec, numSplit;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3){
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+' ) + ' ' + int + '.' + dec;
    }

    var nodeListItem = function(list, callback){
        for (var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    }

   

    
    return {

        getInput: function(){

            return{
            type: document.querySelector(DOMstrings.inputType).value,
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };

        } ,

        

        addListItem: function(obj, type){

            var html, newHtml, element;

            if(type === 'inc'){
                element= DOMstrings.incomeList;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if (type === 'exp'){
                element = DOMstrings.expensesList;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
       
        },

        deleteListItem: function(selectorId) {
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);

        }, 

        clearFields: function(){

            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index , array) {
                current.value ="";
                
            });

            fieldsArr[0].focus();
            
        },

        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc': type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');

            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            }
            else{
                document.querySelector(DOMstrings.percentageLabel).textContent = "----";

            }
        },

        displayPercentage: function(percentages){
            var fields =  document.querySelectorAll(DOMstrings.expPercLabel);

            nodeListItem(fields, function(current, index){
                if (percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }
                else{
                    current.textContent = '--';
                }
            }); 
        },

        changeType: function(){
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ','
            + DOMstrings.inputValue);
            

            nodeListItem(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputButton).classList.toggle('red');

        },

        displaygetMonth: function(){
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September','October',
                'November','December'];

            document.querySelector(DOMstrings.getMonth).textContent = months[month] + ', ' + year;
            
        },

        getDOMstrings: function(){
            return DOMstrings;
        }

    }
})();




var controller = (function(budgetCtrl , UICtrl){

    var setupEventListeners = function(){

        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                return ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', CtrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);

    };

    var updateBudget = function(){
        //1. calculate the budget
        budgetCtrl.calculateBudget();

        //2. return the budget
        var budget = budgetCtrl.getBudget();

        //3. display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentage(percentages);
        

    };




    var ctrlAddItem = function(){
        var input, newItem;

        //1.get the field input data 
        input =  UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {

        //2.Add the item to the budget controller 
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        //3.Add the item to the UI
        UICtrl.addListItem(newItem, input.type);

        //4.Clear fields
        UICtrl.clearFields();

        //5.Update budget
        updateBudget();

        //6.Update percentage
        updatePercentages();

        }

    };
    var CtrlDeleteItem = function(event) {
        var itemId, splitId, type, ID;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemId) {

        splitId = itemId.split('-');
        type = splitId[0];
        ID = parseInt(splitId[1]);

        //1. Delete item from the data structure
        budgetCtrl.deleteItem(type, ID);

        //2. Delete item from the UI
        UICtrl.deleteListItem(itemId);

        //3. Update nand show new budget
        updateBudget();

        //6.Update percentage
        updatePercentages();
        }
     };
    

    return {
        init: function() {
            console.log('working...');
            UICtrl.displaygetMonth();

            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1

            });
            setupEventListeners();
        }
    };

})(budgetController, UIcontroller);

controller.init();

