var should = require('chai').should();

const utils = require('../lib/utils');

var randomstring = require("randomstring");



describe('fixingZXing', function (){
    it('should return a buffer', () => {
        const str = randomstring.generate({
            length: 12,
            charset: 'hex'
        });
        const buf = Buffer.from(str, 'hex');
        const result = utils.fixingZXing(buf);
        result.should.be.instanceof(Buffer);
        
    });
    it('should convert utf-8 encoded Buffers to latin1 encoded Buffers', function(){
        const latin1 = Buffer.from('2355543031303038303030303036302c021402a7689c8181e5c32b839b21f603972512d26504021441b789b47ea70c02ae1b8106d3362ad1cd34de5b0000000030323837789c65503b4ec34010b51b424395c60585810e643433fbf12e5d888d8c14a56095b4c80113b909911345825b701f3a2ec00138044760c68084c46aa57dfbdedb999d37bbadca510108601480830abd45cc74f46711330498a3665f5116a5182f27a080bc0585cc8aee7e4fca9dd7a80d456803486df0615d77ebae69374c1013480c94801103cfc062c67d7d901af288816640819d6818999bb6d9d47cb12cebe9db6bb75a34ddf26cdc6e9f02104abde9fc7492558b8714cd8576e9f5b844832a933347c52e6e89aa786c964d7ad5d5ab3bf91059e9d3cb4ee41fe1a4b705195066c073de321e33f48fe93f881c48ce17a9a7c869c9693efb0e37bae724e3783878f94cb683f764e78ea2d81d2712b090fb1f7b07c9ee7978f80598b65bdd', 'hex');
        const utf8 = Buffer.from('2355543031303038303030303036302c021402c2a768c29cc281c281c3a5c3832bc283c29b21c3b603c2972512c3926504021441c2b7c289c2b47ec2a70c02c2ae1bc28106c393362ac391c38d34c39e5b000000003032383778c29c65503b4ec3834010c2b51b4243c295c38605c285c2810e643433c3bbc3b12e5dc288c28dc28c14c2a560c295c2b4c3880113c2b909c2911345c2825b701f3a2ec3800138044760c386c280c284c3846ac2a57dc3bbc39ec39bc299c29d37c2bbc2adc38a5101086014c280c2830ac2bd45c38c74c3b467113304c298c2a3665f5116c2a5182f27c2a0c280c2bc05c285c38cc28ac3ae7e4fc38ac29dc397c2a80d456803486dc3b0615d77c3abc2ae69374c1013480cc294c2801103c38fc38062c3867d7dc2901ac3b2c288c2816640c281c29d6818c299c29bc2b6c399c3947cc2b12cc3abc3a9c39b6bc2b75a34c39dc3b26cc39c6ec29f02104ac2bdc3a9c3bc74c29255c28bc28714c38dc28576c3a9c3b5c2b844c2832ac2933347c3852e6ec289c2aa786cc2964d7ac395c395c2ab3bc3b91059c3a9c393c38b4ec3a41fc3a1c2a4c2b705195066c38073c39e321e33c3b4c28fc3a93fc2881c48c38e17c2a9c2a7c38869c389693ec3bb0e37c2bac3a724c3a3783878c3b94cc2b6c283c3b764c3a7c28ec2a2c3981d2712c2b0c290c3bb1f7b07c389c3ae7978c3b805c298c2b65bc39d', 'hex');
        const result = utils.fixingZXing(utf8);
        //assert.equal(result, latin1);
        result.should.deep.equal(latin1);
    });
});

describe('stringifyBufferObj',()=>{
    const str = "Hello World!" ;
    const obj = {a: Buffer.from(str), b: 123};
    const result = utils.stringifyBufferObj(obj);
    it('should return an object where all buffer values would be converted to string values', ()=>{
        result.a.should.be.equal(str);
    });
    it('should return an object', ()=>{
        result.should.be.a('object');
    });
    it('should not change values which aren\'t strings', ()=>{
       result.b.should.be.equal(123); 
    });
    
})