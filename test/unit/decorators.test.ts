import { expect } from '../test-helper';
import { 
  Model, 
  Attr,
  HasOne, 
  HasMany, 
  BelongsTo, 
} from '../../src/decorators'
import { Association } from '../../src/associations';
import { JSORMBase } from '../../src/model'

describe('Decorators', () => {
  describe('@Model', () => {
    describe('class options', () => {
      let TestModel : typeof JSORMBase
      let BaseModel : typeof JSORMBase
      let config = {
        apiNamespace: 'api/v1',
        jsonapiType: 'my_types',
        jwt: 'abc123', 
      }

      beforeEach(() => {
        @Model()
        class MyBase extends JSORMBase {}

        @Model(config)
        class MyModel extends MyBase {}

        TestModel = MyModel
        BaseModel = MyBase
      })

      it('preserves defaults for unspecified items', () => {
        expect(TestModel.baseUrl).to.eq('http://please-set-a-base-url.com')
        expect(TestModel.camelizeKeys).to.be.true
      })

      it('correctly assigns options', () => {
        expect(TestModel.apiNamespace).to.eq(config.apiNamespace)
        expect(TestModel.jsonapiType).to.eq(config.jsonapiType)
        expect(TestModel.jwt).to.eq(config.jwt)
      })

      it('does not override parent class options', () => {
        expect(BaseModel.apiNamespace).not.to.eq(config.apiNamespace)
        expect(BaseModel.jsonapiType).not.to.eq(config.jsonapiType)
        expect(BaseModel.jwt).not.to.eq(config.jwt)
      })
    })
  })

  describe('@Attr', () => {
    let BaseModel : typeof JSORMBase

    beforeEach(() => {
      @Model()
      class MyBase extends JSORMBase {}
      BaseModel = MyBase
    })

    context('when used as a factory function', () => {
      it('allows type specification', () => {
        @Model()
        class TestClass extends BaseModel {
          @Attr({type: String}) testField : string
        }

        expect(TestClass.attributeList['testField']).to.include({
          persist: true,
          type: String,
          name: 'testField'
        })
      })

      it('can be used without args', () => {
        @Model()
        class TestClass extends BaseModel {
          @Attr() testField : string
        }

        expect(TestClass.attributeList['testField']).to.include({
          persist: true,
          type: undefined,
          name: 'testField'
        })
      })
    })

    context('when used as raw decorator', () => {
      it('sets up the attribute correctly', () => {
        @Model()
        class TestClass extends BaseModel {
          @Attr testField : string
        }

        expect(TestClass.attributeList['testField']).to.include({
          persist: true,
          type: undefined,
          name: 'testField'
        })
      })
    })
  })

  let singleDecorators = [
    { Assoc: HasMany,   Name: '@HasMany'   },
    { Assoc: HasOne,    Name: '@HasOne'    },
    { Assoc: BelongsTo, Name: '@BelongsTo' },
  ]

  singleDecorators.forEach(({Assoc, Name}) => {
    describe(Name, () => {
      let BaseModel : typeof JSORMBase
      let AssociationModel : typeof JSORMBase

      beforeEach(() => {
        @Model()
        class MyBase extends JSORMBase {}
        BaseModel = MyBase

        @Model({jsonapiType: 'test_associations'})
        class MyAssoc extends BaseModel {}
        AssociationModel = MyAssoc
      })

      context('when used as a factory function', () => {
        it('allows type to be provided as a class', () => {
          @Model()
          class TestClass extends BaseModel {
            @Assoc({type: AssociationModel}) testField : any
          }

          expect(TestClass.attributeList['testField']).to.include({
            persist: true,
            type: AssociationModel,
            name: 'testField'
          })
        })

        it('allows type to be provide as a jsonapi type', () => {
          @Model()
          class TestClass extends BaseModel {
            @Assoc({type: 'test_associations'}) testField : any
          }

          expect(TestClass.attributeList['testField']).to.include({
            persist: true,
            jsonapiType: 'test_associations',
            name: 'testField'
          })
        })

        it('allows a jsonapi type to be provided as a raw string', () => {
          @Model()
          class TestClass extends BaseModel {
            @Assoc('test_associations') testField : any
          }

          expect(TestClass.attributeList['testField']).to.include({
            persist: true,
            jsonapiType: 'test_associations',
            name: 'testField'
          })
        })

        it('attempts to infer type if not specified', () => {
          @Model()
          class TestClass extends BaseModel {
            @Assoc() testAssociation : any
          }

          expect(TestClass.attributeList['testAssociation']).to.include({
            persist: true,
            jsonapiType: 'test_associations',
            name: 'testAssociation'
          })
        })

        it('assigns the correct attribute owner', () => {
          @Model()
          class TestClass extends BaseModel {
            @Assoc() testAssociation : any
          }

          let assoc = TestClass.attributeList['testAssociation'] 

          expect(assoc.owner).to.equal(TestClass)
        })
      })
    })
  });
})