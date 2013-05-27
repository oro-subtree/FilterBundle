<?php

namespace Oro\Bundle\FilterBundle\Tests\Unit\Form\Type\Filter;

use Oro\Bundle\FilterBundle\Tests\Unit\Form\Type\AbstractTypeTestCase;
use Oro\Bundle\FilterBundle\Form\Type\Filter\ChoiceFilterType;
use Oro\Bundle\FilterBundle\Form\Type\Filter\BooleanFilterType;
use Oro\Bundle\FilterBundle\Form\Type\Filter\FilterType;

class BooleanFilterTypeTest extends AbstractTypeTestCase
{
    /**
     * @var BooleanFilterType
     */
    private $type;

    /**
     * @var array
     */
    protected $booleanChoices = array(
        BooleanFilterType::TYPE_YES => 'label_type_yes',
        BooleanFilterType::TYPE_NO  => 'label_type_no',
    );

    protected function setUp()
    {
        parent::setUp();
        $translator = $this->createMockTranslator();
        $this->type = new BooleanFilterType($translator);
        $this->factory->addType(new FilterType($translator));
        $this->factory->addType(new ChoiceFilterType($translator));
    }

    /**
     * {@inheritDoc}
     */
    protected function getTestFormType()
    {
        return $this->type;
    }

    public function testGetName()
    {
        $this->assertEquals(BooleanFilterType::NAME, $this->type->getName());
    }

    /**
     * {@inheritDoc}
     */
    public function setDefaultOptionsDataProvider()
    {
        return array(
            array(
                'defaultOptions' => array(
                    'field_options' => array('choices' => $this->booleanChoices),
                )
            )
        );
    }

    /**
     * {@inheritDoc}
     */
    public function bindDataProvider()
    {
        return array(
            'empty' => array(
                'bindData' => array(),
                'formData' => array('type' => null, 'value' => null),
                'viewData' => array(
                    'value' => array('type' => null, 'value' => null),
                )
            ),
            'predefined value choice' => array(
                'bindData' => array('value' => BooleanFilterType::TYPE_YES),
                'formData' => array('type' => null, 'value' => BooleanFilterType::TYPE_YES),
                'viewData' => array(
                    'value' => array('type' => null, 'value' => BooleanFilterType::TYPE_YES),
                ),
                'customOptions' => array(
                    'field_options' => array(
                        'choices' => $this->booleanChoices
                    ),
                )
            ),
            'invalid value choice' => array(
                'bindData' => array('value' => 'incorrect_value'),
                'formData' => array('type' => null),
                'viewData' => array(
                    'value' => array('type' => null, 'value' => 'incorrect_value'),
                ),
                'customOptions' => array(
                    'field_options' => array(
                        'choices' => $this->booleanChoices
                    ),
                )
            ),
        );
    }
}
