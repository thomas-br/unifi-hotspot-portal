import React, { useEffect, useState } from 'react'
import { navigate } from 'gatsby'
import { useLocation } from '@reach/router'
import queryString from "query-string"
import { Stepper, Button, Container, TextInput, Title, Text, Center, Stack, Loader, Alert, Space } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconBan, IconTrophy } from '@tabler/icons';

import { useDispatch, useSelector } from 'react-redux'
import { setRequest, update } from '../../../state/accessRequestSlice'

const CaptivePortalPage = ({params}) => {
    const loaction = useLocation()
    const dispatch = useDispatch()
    const { data, waiting } = useSelector(state => state.accessRequest)
    const siteId = params['siteId']
    const {ap, id, t, url, ssid} = queryString.parse(loaction.search)

    const form = useForm({
        initialValues: {
          name: '',
        }
      })

    const [active, setActive] = useState(0)
    const [seconds, setSeconds] = useState(-1)

    useEffect(() => {
        if(!ap || !id || !siteId || !ssid){
            navigate("/error");
        }
      }, [ap, id, siteId, ssid])


      useEffect(() => {
        if (seconds > 0) {
            setTimeout(() => {
                setSeconds(seconds-1)
            }, 1000);
        } else if (seconds === 0) {
            window.location = url
        }
      }, [seconds])

    const requestAccess = async (values) => {
        // TODO: centralize API config for both production & development
        const response = await fetch("http://localhost:1337/api/access-request", {
            method: 'POST', 
            mode: 'cors', 
            cache: 'no-cache', 
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({
                mac: id,
                site: siteId,
                ap,
                ...values
            })
          });
          const resultBody = await response.json()
          dispatch(setRequest(resultBody))
          setActive(1)
          waitAndQueryState(resultBody.uuid)
    }

    const waitAndQueryState = (uuid) => {
        setTimeout(() => {
            queryState(uuid)
        }, 1000)
    }

    const queryState = async (uuid) => {
            // TODO: centralize API config for both production & development
            const response = await fetch(`http://localhost:1337/api/access-request/${uuid}`, {
                method: 'GET', 
                mode: 'cors', 
                cache: 'no-cache', 
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                redirect: 'follow',
                referrerPolicy: 'no-referrer'
            });
            const resultBody = await response.json()
            dispatch(update(resultBody))
            if (resultBody.status === "declined") {
                setActive(2)
            } else if (resultBody.status === "success") {
                setActive(3)
                setSeconds(10)
            } else {
                waitAndQueryState(uuid)
            }
    }
    // TODO: add i18n
    return (
        <Container mt="xl">
            <Center>
                <Stack my="xl">
                    <Title align='center'>
                        Willkommen im Netzwerk<br/>
                        <Text component="span" inherit>{ssid}</Text><br/>
                    </Title>
                    <Text size="lg" color="dimmed" align='center'>
                        Gib deinen Namen in das untenstehende Feld ein, und beantrage Zugriff auf das Internet
                    </Text>
                </Stack>
            </Center>
            <Stepper active={active} onStepClick={setActive} breakpoint="sm">
                <Stepper.Step label="Dein Name" description="Beantrage Zugriff" allowStepSelect={false}>
                    <form onSubmit={form.onSubmit((values) => requestAccess(values))}>
                        <Stack>
                            <TextInput
                                withAsterisk
                                label="Name"
                                placeholder="Dein Name"
                                disabled={active != 0}
                                {...form.getInputProps('name')}
                            />
                            <Button type="submit" disabled={active != 0 || waiting} >{waiting ? <Loader color="white"/> : <span>Zugriff beantragen</span>}</Button>
                        </Stack>
                    </form>
                </Stepper.Step>
                <Stepper.Step label="Genehmigung" description="Warte auf Genehmigung" allowStepSelect={false}>
                    <Center>
                        <Space h="md" />
                        <Alert icon={<Loader color="white"/>} title="Warte auf Bestätigung" variant="filled">
                            Deine Anfrage ist gesendet. Warte einen Moment bis sie bestätigt wurde.
                        </Alert>
                    </Center>
                </Stepper.Step>
                <Stepper.Step label="Internet" description="Surfe im Internet" allowStepSelect={false}>
                    <Center>
                        <Space h="md" />
                        <Alert icon={<IconBan size={16} />} title="Du hast hier nichst verloren" variant="filled" color="red">
                            {data?.message || "Deine Anfrage wurde abgelehnt. Leider wurde ein Zugriff auf das Internet nicht gestattet"}
                        </Alert>
                    </Center>
                    
                </Stepper.Step>
                <Stepper.Completed>
                    <Center>
                        <Space h="md" />
                        <Alert icon={<IconTrophy size={16} />} title="Es kann losgehen" variant="filled" color="green">
                            Du hast nun Zugriff auf das Internet und kannst loslegen!<br/>
                            Du wirst in {seconds} automatisch weitergeleitet.
                        </Alert>
                    </Center>
                </Stepper.Completed>
            </Stepper>
        </Container>
    )
}

export default CaptivePortalPage
