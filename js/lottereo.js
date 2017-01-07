     // address of the contract on testnet
      // var addr = '0x93ff7ee96a55f777f311f511b19586393f5598df';
      
      //address of contract on live net
      var addr ='0xd0345951e1c1c533eba7bad46fe318406cf107d6';

      // abi definition
      var abi = [{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"draws","outputs":[{"name":"drawDate","type":"uint256"},{"name":"eth_address","type":"address"}],"type":"function"},{"constant":true,"inputs":[],"name":"getPot","outputs":[{"name":"pot","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"getLatestDraw","outputs":[{"name":"_latest","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_guess","type":"uint256"}],"name":"buyTicket","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_eth_address","type":"address"}],"name":"addDraw","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"getWinningNumber","outputs":[{"name":"_winner","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"numDraws","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"getPreviousDraw","outputs":[{"name":"_previous","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"_query","type":"address"}],"name":"getPrizeValue","outputs":[{"name":"_value","type":"uint256"}],"type":"function"},{"inputs":[],"type":"constructor"}];
      var drawAbi = [{"constant":true,"inputs":[],"name":"entryFee","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_newContract","type":"address"}],"name":"transferPot","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"previousDrawAddress","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[],"name":"nextDraw","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[],"name":"numTickets","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"winningaddresses","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[],"name":"getPot","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"winningNumber","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"tickets","outputs":[{"name":"guess","type":"uint256"},{"name":"eth_address","type":"address"}],"type":"function"},{"constant":true,"inputs":[],"name":"payout","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_buyer","type":"address"},{"name":"_guess","type":"uint256"}],"name":"buyTicket","outputs":[{"name":"ticketid","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"organiser","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[],"name":"drawDate","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"actualDrawDate","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[],"name":"doDraw","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"_query","type":"address"}],"name":"getPrizeValue","outputs":[{"name":"_value","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"drawn","outputs":[{"name":"","type":"bool"}],"type":"function"},{"inputs":[{"name":"_offset","type":"uint256"},{"name":"_entryFee","type":"uint256"},{"name":"_organiser","type":"address"},{"name":"_previousDrawAddress","type":"address"}],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_ticketid","type":"uint256"}],"name":"BuyTicket","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_winningNumber","type":"uint256"}],"name":"DrawDone","type":"event"}]
      
      var lottereo = null;
      
      var buyTicket = function() {
        var guess = $('#guess').val();
        try {
          guess = parseInt(guess);
        } catch(e) {
          return Materialize.toast('Please enter a valid guess', 4000);
        }
        if (guess < 1 || guess > 1000) {
          return Materialize.toast('Please enter a number between 1 and 1,000', 4000);
        }

        var ticket_price = web3.toWei(0.1, 'ether');
        lottereo.buyTicket(guess,{from:web3.eth.accounts[0], value:ticket_price, gas:300000 }, function(err, data) {
          console.log(err, data);
          if(!err) {
            Materialize.toast('Sent transaction to the blockchain', 4000);
          } else {
            Materialize.toast('Something went wrong', 4000);
          }
        });
      }
      
      function reveal(){
      $('#play').removeClass('hide');
    }
      

      var init = function() {
        if (typeof web3 === 'undefined') {
          $('#livecontainer').hide();
          $('#deadcontainer').removeClass('hide');
          return;
        }
        
        lottereo = web3.eth.contract(abi).at(addr);
        var drawid = window.location.search.replace(/^\?/,'');
        if (drawid == "") {
          lottereo.getLatestDraw(function(err,data) {
            render_draw(data);
            console.log(data);
          });
        }    //if
        else {
          reveal();
          render_draw(drawid);
        };
      }

      var render_draw = function (drawid) {
        var draw = web3.eth.contract(drawAbi).at(drawid);
        var drawurl = "http://etherscan.io/address/"+drawid;
        $('a#etherscan1').attr('href',drawurl);
        $('a#etherscan2').attr('href',drawurl);
        draw.numTickets(function(err,data){
          console.log ("numtickets", err,data.toString());
          var numTickets =data.toString();
          $('#numTickets').html(numTickets);
          $('#numTickets2').html(numTickets);
        });
        draw.drawDate(function (err,data){
          console.log("drawDate", err, data.toString());
          var drawDate = new Date(parseInt(data.toString())*1000);
          $('#drawDate').html(drawDate.toString());
        });
        draw.getPot(function(err,data){
          console.log("pot", err,data.toString());
          var wei = parseInt(data);
          var eth = web3.fromWei(wei, 'ether');
          $('#total').html(eth);
        });
        draw.entryFee(function(err,data){
          console.log("entry fee", err, data.toString());
          var wei = parseInt(data);
          var eth = web3.fromWei(wei,'ether');
          $('#entryFee').html(eth);
        });
        draw.drawn(function(err,data){
          console.log("drawn", err,data);
          var drawn = data;
          if (drawn) {
            $('#buy-form').hide();
            $('#not-drawn').hide();
          }
          else {
            $('#is-drawn').hide();
            var events = draw.allEvents();
            // watch for changes
            events.watch(function(error, event){
              if (!error) {
                Materialize.toast('Event detected! Refreshing...', 4000);
                render_draw(drawid);
                console.log(event);
              };  //if !error
            });  //events.watch
          }
        })

        draw.winningNumber(function(err,data){
          console.log("winning number", err,data.toString());
          var winningNumber = data.toString();
          $('#winning-number').html(winningNumber)
        })

        draw.actualDrawDate(function(err,data){
          console.log("actual draw date", err,data.toString());
          var actualDrawDate = new Date(parseInt(data.toString())*1000);
          $('#actualDrawDate').html(actualDrawDate)
        })

        draw.payout(function(err,data){
          console.log("payout", err,data.toString());
          var payout = data.toString();
          $('#payout').html(payout)
        })

        draw.winningaddresses(function(err,data){
          console.log("winning addresses", err,data);
          //var payout = data.toString();
          //$('#payout').html(payout)
        })

        draw.previousDrawAddress(function(err,data){
          console.log(err,data);
          var previousDrawAddress = data.toString();
          if (previousDrawAddress == "0x0000000000000000000000000000000000000000"){
            $('#nav-previous').hide();
          }
          else {
            var url = window.location.origin+window.location.pathname+'?'+previousDrawAddress;
            console.log("previous url = ", url);
            $('#previous-btn').attr('href', url)
          }
        });
        draw.nextDraw(function(err,data){
          console.log(err,data);
          var nextDraw = data.toString();
          if (nextDraw == "0x0000000000000000000000000000000000000000"){
            $('#nav-next').hide();
          }
          else {
            var url = window.location.origin+window.location.pathname+'?'+nextDraw;
            console.log("next url = ", url);
            $('#next-btn').attr('href', url)
          }
        })

      }; 

      $( document ).ready(init);

